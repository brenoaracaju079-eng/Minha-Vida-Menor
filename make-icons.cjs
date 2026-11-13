const fs = require("fs");
const sharp = require("sharp");
fs.mkdirSync("public/icons", { recursive: true });

const figure = `M256 176C222 176 200 192 196 222L188 296C187 308 205 311 208 299L220 238L222 330L214 420C213 434 238 438 242 424L256 350L270 424C274 438 299 434 298 420L290 330L292 238L304 299C307 311 325 308 324 296L316 222C312 192 290 176 256 176Z`;
const heart = `M256 236C234 220 230 203 243 199C250 197 256 202 256 207C256 202 262 197 269 199C282 203 278 220 256 236Z`;

function mark({ body, tape, ticks, heartColor }) {
  return `
  <circle cx="256" cy="126" r="34" fill="${body}"/>
  <path d="${figure}" fill="${body}"/>
  <ellipse cx="256" cy="272" rx="66" ry="17" fill="none" stroke="${tape}" stroke-width="13"/>
  <path d="M320 276C346 290 356 330 350 372" fill="none" stroke="${tape}" stroke-width="13" stroke-linecap="round"/>
  <g stroke="${ticks}" stroke-width="3" opacity="0.7">
    <path d="M220 287v8M240 290v8M262 290v8M284 288v8M330 296l7 3M338 316l8 2M343 338l8 1"/>
  </g>
  <path d="${heart}" fill="${heartColor}"/>`;
}

const icon = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
<rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
${mark({ body: "#ffffff", tape: "#facc15", ticks: "#7a5c00", heartColor: "#fb7185" })}
</svg>`;

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 80 400 340">
${mark({ body: "#059669", tape: "#facc15", ticks: "#7a5c00", heartColor: "#f43f5e" })}
</svg>`;

fs.writeFileSync("public/icon.svg", icon(112));
fs.writeFileSync("public/logo-mark.svg", logo);

(async () => {
  const full = Buffer.from(icon(0));
  const round = Buffer.from(icon(112));
  await sharp(round).resize(192, 192).png().toFile("public/icons/icon-192.png");
  await sharp(round).resize(512, 512).png().toFile("public/icons/icon-512.png");
  await sharp(full).resize(512, 512).png().toFile("public/icons/maskable-512.png");
  await sharp(full).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
  await sharp(Buffer.from(logo)).resize(1024, 868).png().toFile("public/icons/logo-transparente.png");
  console.log("ok");
})();
