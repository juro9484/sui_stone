import { Camera, Vector3, Euler } from 'three';
import { CameraTarget } from './cameraTargets';

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
  
  // Move camera to target
  public moveToTarget(target: CameraTarget): void {
    // Save current position and rotation
    this.startPosition = new Vector3().copy(this.camera.position);
    this.startRotation = new Euler().copy(this.camera.rotation);
    
    // Set target position and rotation
    this.targetPosition = target.position;
    this.targetRotation = target.rotation;
    
    // Set animation duration (or use default)
    this.duration = target.duration || 1000;
    
    // Disable orbit controls during movement (unless we're going to default view)
    if (target.targetId !== 'default-view') {
      this.setOrbitControlsEnabled(false);
      this.orbitControlsEnabled = false;
    }
    
    // Start animation
    this.startTime = Date.now();
  }
  
  // Reset to default state
  public reset(): void {
    this.targetPosition = null;
    this.startPosition = null;
    this.targetRotation = null;
    this.startRotation = null;
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
      // Animation complete - set final values
      this.camera.position.copy(this.targetPosition);
      this.camera.rotation.copy(this.targetRotation);
      
      // Clear animation state
      this.reset();
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
}