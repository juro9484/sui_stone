import { Camera, Vector3, Euler } from 'three';
import { CameraTarget, CameraPosition } from './cameraTargets';

// Class to handle camera animations and movements
export class CameraController {
  // Camera reference
  private camera: Camera;
  
  // Animation state
  private targetPosition: Vector3 | null = null;
  private startPosition: Vector3 | null = null;
  private startRotation: Euler | null = null;
  private targetRotation: Euler | null = null;
  private startTime: number = 0;
  private duration: number = 1000;
  
  // Sequence animation state
  private currentTarget: CameraTarget | null = null;
  private sequencePositions: CameraPosition[] | null = null;
  private currentSequenceIndex: number = 0;
  
  // Controls state
  private orbitControlsEnabled: boolean = true;
  private setOrbitControlsEnabled: (enabled: boolean) => void;
  
  constructor(
    camera: Camera, 
    setOrbitControlsEnabled: (enabled: boolean) => void
  ) {
    this.camera = camera;
    this.setOrbitControlsEnabled = setOrbitControlsEnabled;
  }
  
  // Move camera to target (handles both single and sequence targets)
  public moveToTarget(target: CameraTarget): void {
    // Store the target for potential sequences
    this.currentTarget = target;
    
    // Disable orbit controls during movement (unless we're going to default view)
    if (target.targetId !== 'default-view') {
      this.setOrbitControlsEnabled(false);
      this.orbitControlsEnabled = false;
    }
    
    // Check if this target has a sequence
    if (target.sequence && target.sequence.length > 0) {
      // Setup for sequence animation
      this.sequencePositions = target.sequence;
      this.currentSequenceIndex = 0;
      
      // Start with the first position in the sequence
      this.startSequencePosition();
    } else {
      // Single position animation (traditional approach)
      this.sequencePositions = null;
      this.currentSequenceIndex = 0;
      
      // Save current position and rotation
      this.startPosition = new Vector3().copy(this.camera.position);
      this.startRotation = new Euler().copy(this.camera.rotation);
      
      // Set target position and rotation
      this.targetPosition = target.position;
      this.targetRotation = target.rotation;
      
      // Set animation duration (or use default)
      this.duration = target.duration || 1000;
      
      // Start animation
      this.startTime = Date.now();
    }
  }
  
  // Start animation for the next position in a sequence
  private startSequencePosition(): void {
    if (!this.sequencePositions || this.currentSequenceIndex >= this.sequencePositions.length) {
      // Sequence is empty or complete
      this.completeAnimation();
      return;
    }
    
    // Get the current sequence position
    const currentPos = this.sequencePositions[this.currentSequenceIndex];
    
    // Save current camera position and rotation
    this.startPosition = new Vector3().copy(this.camera.position);
    this.startRotation = new Euler().copy(this.camera.rotation);
    
    // Set target position and rotation
    this.targetPosition = currentPos.position;
    this.targetRotation = currentPos.rotation;
    
    // Set duration for this segment
    this.duration = currentPos.duration;
    
    // Start animation
    this.startTime = Date.now();
  }
  
  // Move to the next position in the sequence
  private moveToNextSequencePosition(): void {
    // Increment the sequence counter
    this.currentSequenceIndex++;
    
    // Check if we're done with the sequence
    if (this.sequencePositions && this.currentSequenceIndex < this.sequencePositions.length) {
      // Start the next position animation
      this.startSequencePosition();
    } else {
      // Sequence is complete
      this.completeAnimation();
    }
  }
  
  // Finish animation and call any completion handlers
  private completeAnimation(): void {
    // Call onComplete if available
    if (this.currentTarget?.onComplete) {
      this.currentTarget.onComplete();
    }
    
    // Clean up animation state
    this.reset();
  }
  
  // Reset to default state
  public reset(): void {
    this.targetPosition = null;
    this.startPosition = null;
    this.targetRotation = null;
    this.startRotation = null;
    this.sequencePositions = null;
    this.currentSequenceIndex = 0;
    this.currentTarget = null;
  }
  
  // Enable orbit controls
  public enableOrbitControls(): void {
    this.setOrbitControlsEnabled(true);
    this.orbitControlsEnabled = true;
  }
  
  // Update camera position and rotation (call in animation frame)
  public update(): void {
    // Skip if no animation is in progress
    if (!this.targetPosition || !this.startPosition || 
        !this.targetRotation || !this.startRotation) {
      return;
    }
    
    // Calculate progress
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    if (progress < 1) {
      // Apply easing function for smoother animation (ease-out cubic)
      const t = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate position
      this.camera.position.lerpVectors(
        this.startPosition,
        this.targetPosition,
        t
      );
      
      // Interpolate rotation
      this.camera.rotation.x = this.startRotation.x + 
        (this.targetRotation.x - this.startRotation.x) * t;
        
      this.camera.rotation.y = this.startRotation.y + 
        (this.targetRotation.y - this.startRotation.y) * t;
        
      this.camera.rotation.z = this.startRotation.z + 
        (this.targetRotation.z - this.startRotation.z) * t;
    } else {
      // Animation segment complete - set final values
      this.camera.position.copy(this.targetPosition);
      this.camera.rotation.copy(this.targetRotation);
      
      // Check if we're in a sequence
      if (this.sequencePositions && this.currentSequenceIndex < this.sequencePositions.length) {
        // Continue to the next position in the sequence
        this.moveToNextSequencePosition();
      } else {
        // Single animation or last in sequence - complete
        this.completeAnimation();
      }
    }
  }
  
  // Apply position constraints to keep camera within bounds
  public applyConstraints(minX: number, maxX: number, 
                         minY: number, maxY: number,
                         minZ: number, maxZ: number): void {
    this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
    this.camera.position.y = Math.max(minY, Math.min(maxY, this.camera.position.y));
    this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
  }
  
  // Check if camera is currently animating
  public isAnimating(): boolean {
    return this.targetPosition !== null;
  }
  
  // Get orbit controls state
  public areOrbitControlsEnabled(): boolean {
    return this.orbitControlsEnabled;
  }
  
  // Get the current target the camera is moving to
  public getCurrentTarget(): CameraTarget | null {
    return this.currentTarget;
  }
  
  // Get the current sequence position index
  public getCurrentSequenceIndex(): number {
    return this.currentSequenceIndex;
  }
}