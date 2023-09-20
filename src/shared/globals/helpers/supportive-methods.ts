export class SupportiveMethods {
  static uppercaseFirstLetter(text: string): string {
    const pureText = text.toLowerCase();
    return pureText.charAt(0).toUpperCase() + pureText.slice(1);
  }

  static lowercase(text: string): string {
    return text.toLowerCase();
  }
}
