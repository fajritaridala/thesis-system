import CryptoJs from 'crypto-js';
import { RANDOMIZE_SECRET } from './env';

const randomize = {
  async encrypt(text: string) {
    return CryptoJs.AES.encrypt(text, RANDOMIZE_SECRET).toString();
  },
  async decrypt(chiperText: string) {
    const decodeChiperText = decodeURIComponent(chiperText);
    if (!decodeChiperText) throw new Error('chiper text is undefined');
    try {
      const bytes = CryptoJs.AES.decrypt(decodeChiperText, RANDOMIZE_SECRET);
      const decrypted = bytes.toString(CryptoJs.enc.Utf8);
      if (decrypted === undefined) {
        throw new Error('decrypted failed - invalid chipertext or key');
      }
      return decrypted;
    } catch {
      throw new Error('failed to decrypt address');
    }
  },
};

export default randomize;
