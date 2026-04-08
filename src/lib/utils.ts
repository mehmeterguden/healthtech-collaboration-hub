import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateProfileSlug(firstName: string, lastName: string, id: string) {
  const charMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  
  const sanitize = (str: string) => {
    let s = str.replace(/[çğıöşüÇĞİÖŞÜ]/g, m => charMap[m] || m);
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const first = sanitize(firstName);
  const last = sanitize(lastName);
  const fullName = `${first}-${last}`;
  
  if (fullName.length > 20) {
    return `${first}-${id}`;
  }
  return `${fullName}-${id}`;
}
