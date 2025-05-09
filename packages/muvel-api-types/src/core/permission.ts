export interface BasePermission {
  read: boolean
  edit: boolean
  delete: boolean
}

export const masterPermission = {
  read: true,
  edit: true,
  delete: true,
}
