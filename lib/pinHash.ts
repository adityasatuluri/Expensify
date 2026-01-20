// Simple PIN hashing utility for client-side use
// Note: For production, implement server-side hashing with bcrypt

export function hashPin(pin: string): string {
  // Simple hash for demonstration - in production use bcrypt or similar
  // This converts PIN to a consistent string representation
  const sanitized = pin.trim();
  
  // Create a simple hash by converting each character to its charCode
  let hash = 0;
  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `hash_${Math.abs(hash)}_${sanitized.length}`;
}

export function verifyPinHash(pin: string, hash: string): boolean {
  // Verify PIN against stored hash
  return hashPin(pin) === hash;
}
