import { expect } from 'chai';
import StringUtil from '../../util/string-util';

describe('string-util.ts', function() {
    const decoded: string = `These are not the droids you are looking for!`;
    const encoded: string = `VGhlc2UgYXJlIG5vdCB0aGUgZHJvaWRzIHlvdSBhcmUgbG9va2luZyBmb3Ih`;

    it('should encode a string', function() {
        const newEncoded: string = StringUtil.base64Encode(decoded);
        expect(newEncoded).to.not.eql(decoded);
        expect(newEncoded).to.exist;
        expect(newEncoded).to.eql(encoded);
    });

    it('should decode a valid base64 string', function() {
        const newDecoded: string = StringUtil.base64Decode(encoded);
        expect(newDecoded).to.not.eql(encoded);
        expect(newDecoded).to.exist;
        expect(newDecoded).to.eql(decoded);
    });

});