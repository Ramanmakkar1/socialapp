type Style = { id: string; label: string; map: (text: string) => string };

function alphabet(upper: number, lower: number, digits?: number, exceptions: Record<string, number> = {}) {
  return (text: string) => Array.from(text, (char) => {
    const code = char.codePointAt(0)!;
    const mapped = exceptions[char] ?? (code >= 65 && code <= 90 ? upper + code - 65 :
      code >= 97 && code <= 122 ? lower + code - 97 :
      digits !== undefined && code >= 48 && code <= 57 ? digits + code - 48 : code);
    return String.fromCodePoint(mapped);
  }).join("");
}

const smallCaps = "\u1d00\u0299\u1d04\u1d05\u1d07\ua730\u0262\u029c\u026a\u1d0a\u1d0b\u029f\u1d0d\u0274\u1d0f\u1d18\u01eb\u0280\ua731\u1d1b\u1d1c\u1d20\u1d21x\u028f\u1d22";
const caps = Array.from(smallCaps);

export const FONT_STYLES: Style[] = [
  { id: "bold", label: "Bold", map: alphabet(0x1d400, 0x1d41a, 0x1d7ce) },
  { id: "italic", label: "Italic", map: alphabet(0x1d434, 0x1d44e, undefined, { h: 0x210e }) },
  { id: "bold-italic", label: "Bold italic", map: alphabet(0x1d468, 0x1d482) },
  { id: "script", label: "Script", map: alphabet(0x1d49c, 0x1d4b6, undefined, { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 }) },
  { id: "bold-script", label: "Bold script", map: alphabet(0x1d4d0, 0x1d4ea) },
  { id: "double-struck", label: "Double-struck", map: alphabet(0x1d538, 0x1d552, 0x1d7d8, { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 }) },
  { id: "monospace", label: "Monospace", map: alphabet(0x1d670, 0x1d68a, 0x1d7f6) },
  { id: "sans-bold", label: "Sans bold", map: alphabet(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { id: "fullwidth", label: "Fullwidth", map: alphabet(0xff21, 0xff41, 0xff10) },
  { id: "circled", label: "Circled", map: alphabet(0x24b6, 0x24d0) },
  { id: "small-caps", label: "Small caps", map: (text) => Array.from(text, (char) => {
    const code = char.codePointAt(0)!;
    const index = code >= 65 && code <= 90 ? code - 65 : code >= 97 && code <= 122 ? code - 97 : -1;
    return String.fromCodePoint(index < 0 ? code : caps[index].codePointAt(0)!);
  }).join("") },
];

export function convert(text: string, id: string): string {
  return FONT_STYLES.find((style) => style.id === id)?.map(text) ?? text;
}
