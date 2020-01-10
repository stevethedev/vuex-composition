import { ModuleRef } from "./module-ref";

/**
 * Extracts a path from the given parentModule.
 *
 * @param parentModule The parent module to extract the path from.
 */
export const getPath = (
  title?: string,
  parentModule?: ModuleRef<any, any>
): string | null => {
  if (title) {
    return parentModule
      ? parentModule
          .getPath()
          .concat([title])
          .join("/")
      : title;
  }
  return null;
};
