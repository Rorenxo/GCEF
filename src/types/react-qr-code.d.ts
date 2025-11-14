import "react";

declare module "react" {
  interface SVGProps<T> {
    includeMargin?: boolean;
  }
}