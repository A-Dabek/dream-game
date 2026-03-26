import interfaceIconsJson from '../interface-icons.json';

export type InterfaceIconName = keyof typeof interfaceIconsJson;

export class InterfaceIconRegistry {
  static resolveIconPath(iconName: InterfaceIconName): string {
    const path = interfaceIconsJson[iconName];
    if (path === undefined) {
      throw new Error(
        `Interface icon "${iconName}" not found in interface-icons.json`,
      );
    }
    return path;
  }
}
