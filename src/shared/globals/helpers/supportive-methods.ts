import { config } from '@root/config';
import { request } from 'urllib';

export class SupportiveMethods {
  static uppercaseFirstLetter(text: string): string {
    const pureText = text.toLowerCase();
    return pureText.charAt(0).toUpperCase() + pureText.slice(1);
  }

  static lowercase(text: string): string {
    return text.toLowerCase();
  }

  static generateRandomIntegers(length: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return parseInt(result, 10);
  }

  static parseJson(prop: string): any {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }

  static isURL(str: string): boolean {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return !!pattern.test(str);
  }

  static extractURLsFromString(inputString: string): string[] | null {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = inputString.match(urlRegex);
    return urls;
  }
}
