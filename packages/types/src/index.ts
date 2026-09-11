export interface UserDTO { id: string; email: string; name: string; role: 'USER'|'ADMIN'; }
export interface ProductDTO { id: string; title: string; status: string; }
export interface AIGenerationDTO { id: string; type: 'ANALYZE'|'DESCRIPTION'|'HASHTAGS'|'IMAGE_PROCESS'; }