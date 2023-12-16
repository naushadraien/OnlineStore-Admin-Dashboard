import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PriceFormatter = new Intl.NumberFormat("en-Us", {
  style: "currency",
  currency: "USD",
});

//The Intl.NumberFormat object enables language-sensitive number formatting.

//Example
// const number = 123456.789;

// console.log(
//   new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
//     number,
//   ),
// );
