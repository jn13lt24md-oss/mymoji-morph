// Prompts for the newer emoji, keyed by emoji name.
// Each entry holds one block per model: { prompt, negative }.
// Kontext takes no negative prompt.
// Use from morph.js:
//   const NEW_EMOJI_PROMPTS = require('./new_emoji_prompts');
//   const entry = NEW_EMOJI_PROMPTS['phoenix'];
//   const { prompt, negative } = entry.photomaker;

module.exports = {
  phoenix: {
    kontext: {
      prompt:
        "Transform this person's face into a phoenix: keep their facial structure and identity, give them fiery orange, red and gold feathered texture on their skin and hair like flames rising upward, intense glowing ember eyes, a sharp pointed beak-like nose, small feathers along the cheekbones and jawline, skin glowing with warm firelight. Dark mystical background, cinematic portrait.",
    },
    photomaker: {
      prompt:
        'a photo of an emoji style phoenix character img, round emoji head, simple expressive features, fiery orange red and gold feathered texture, glowing ember eyes, sharp pointed beak-like nose, small feathers on cheeks, warm firelight glow, emoji character style',
      negative:
        'icy, frozen, blue, cold, water, extinguished, dull, grey, dead, plain feathers, human nose, ordinary eyes',
    },
  },
  shark: {
    kontext: {
      prompt:
        'Transform this person into a playful shark character: keep their face and identity, give them blue-grey shark skin, a dorsal fin on the head, and a wide toothy grin with small sharp teeth. Underwater blue light, fun and friendly.',
    },
    photomaker: {
      prompt:
        'a photo of an emoji style shark character img, round emoji head, simple expressive features, blue-grey skin, dorsal fin on head, toothy playful grin, underwater light, bubbles, emoji character style',
      negative:
        'friendly dolphin, cute, happy, land animal, no teeth, no fin, colorful, sunshine',
    },
  },
  kraken: {
    kontext: {
      prompt:
        'Turn this person into a Kraken sea monster: keep their face and identity, give them dark teal skin with suckers, tentacles as hair, and glowing eyes. Stormy deep-sea mood, dramatic lighting.',
    },
    photomaker: {
      prompt:
        'a photo of a kraken emoji img, round emoji head, tentacles for hair with suckers, dark teal skin, glowing eyes, deep sea, stormy dramatic lighting, cinematic, emoji character style',
      negative:
        'bright, sunny, friendly, no tentacles, human hair, small, cute, peaceful, shallow water',
    },
  },
  alien: {
    kontext: {
      prompt:
        'Transform this person into a friendly alien: keep their face and identity, give them smooth green skin, enlarged glowing eyes, no eyebrows, two small antennae and a faint glow. Starry purple space background.',
    },
    photomaker: {
      prompt:
        'portrait of a friendly alien emoji img, emoji character style, smooth green skin, large glowing eyes, 2 small antennae, starry space background, neon glow, round emoji head',
      negative:
        'hostile, grey alien, scary, no antennae, human, realistic, dark, evil eyes, earthling',
    },
  },
  very_cold: {
    kontext: {
      prompt:
        'Transform this person into someone extremely cold and frozen: keep their face and identity, give them pale icy blue and white skin with frost patches, ice crystals forming on their hair and eyebrows, darkened areas on cheeks and nose from extreme cold, shivering expression, lips turned blue, frost breath visible, icicles hanging from their chin. Harsh cold blue lighting, snowstorm background, cinematic freezing atmosphere.',
    },
    photomaker: {
      prompt:
        'a photo of an almost frozen with severe frostbite emoji expression img, round emoji head, pale icy blue and white skin, emoji character style, blue lips, severe cold shivering expression, frost breath, harsh cold blue lighting, snowstorm background',
      negative:
        'warm, sunny, tropical, healthy, rosy, glowing skin, no ice, no frostbite, sweating, fire, heat, colorful, vibrant, summer',
    },
  },
  unicorn: {
    instantid: {
      prompt:
        'portrait of a person as a magical unicorn, pearly spiralled horn on forehead, long pastel pink lilac and mint mane-like hair, glitter, sparkles, dreamy soft lighting, pastel background, highly detailed.',
      negative:
        'realistic horse, dark colors, no horn, evil, demonic, sharp, aggressive, plain, no sparkle',
    },
    photomaker: {
      prompt:
        'a unicorn emoji img, pearly spiral horn on forehead, long pastel rainbow mane hair, glitter, sparkles, dreamy soft lighting, pastel background, emoji character style, head only',
      negative:
        'realistic horse, dark colors, no horn, evil, demonic, sharp, aggressive, plain, no sparkle',
    },
  },
  frankenstein: {
    instantid: {
      prompt:
        "portrait of a person as Frankenstein's monster, green skin, flat-top head, neck bolts, stitched scars across forehead, heavy brow, moody gothic lighting, highly detailed",
      // Changed: removed angelic/halo/white/pure (they suit an angel).
      negative:
        'pale skin, normal skin tone, smooth forehead, no bolts, no stitches, innocent, kind, bright',
    },
    photomaker: {
      prompt:
        "Frankenstein's monster emoji img, green skin, round emoji head, flat head, neck bolts, stitches and scars, gothic stormy lighting, emoji character style, head only",
      negative:
        'pale skin, normal skin tone, smooth forehead, no bolts, no stitches, innocent, kind, bright',
    },
  },
  zombie: {
    instantid: {
      prompt:
        'portrait of a person as a cartoon-spooky zombie, pale grey-green skin, sunken eyes, torn skin, messy hair, dark circles, eerie fog, highly detailed',
      // Changed: "no fangs" replaced with fangs and healthy-look terms.
      negative:
        'fangs, glowing healthy skin, clean tidy hair, bright, sunny, happy, alive, colorful, casual',
    },
    photomaker: {
      prompt:
        'a zombie emoji img, round emoji head, pale grey-green skin, sunken eyes, tattered messy hair, dark circles, eerie fog, emoji character style, head only',
      negative:
        'fangs, glowing healthy skin, clean tidy hair, bright, sunny, happy, alive, colorful, casual',
    },
  },
  pirate: {
    instantid: {
      prompt:
        'portrait of a person as a swashbuckling pirate, tricorn hat, red bandana, gold hoop earring, eye patch, weathered tan skin, ship deck at sunset, highly detailed',
      negative:
        'innocent, scholarly, fancy, modern, friendly, no weapons, clean, boring',
    },
    photomaker: {
      prompt:
        'a pirate emoji img, tricorn hat, red bandana, gold earring, eye patch, sunset ship deck, adventurous grin, emoji character style, no body only head',
      negative:
        'innocent, scholarly, fancy, modern, friendly, no weapons, clean, boring',
    },
  },
  genie: {
    instantid: {
      prompt:
        'portrait of a person as a magical genie, blue skin, golden turban with jewel, gold arm bands, swirling smoke below, mystical glow, Arabian night background, highly detailed',
      negative:
        'realistic, human, plain, no magic, modern, desert, sad, ordinary',
    },
    photomaker: {
      prompt:
        'a genie emoji img, blue skin, gold turban with jewel, swirling magical smoke, glowing sparkles, Arabian nights palace, emoji head character style',
      negative:
        'realistic, human, plain, no magic, modern, desert, sad, ordinary',
    },
  },
  philosopher: {
    instantid: {
      prompt:
        'portrait of a person as an ancient Greek philosopher, laurel wreath on head, white draped toga, marble columns, warm Mediterranean light, wise calm expression, classical sculpture style, highly detailed',
      // Changed: removed "no glasses" (does not fit a wreathed philosopher).
      negative: 'realistic, marble statue, toga folds, hat, plain head',
    },
    photomaker: {
      prompt:
        'portrait of a person img as an emoji style philosopher character, round yellow glowing emoji head, simple expressive features, golden laurel wreath on top of head, hand touching chin in a thoughtful pose, clear simple emoji look, highly detailed',
      negative: 'realistic, marble statue, toga folds, hat, plain head',
    },
  },
  laughing_out_loud: {
    pixar: {
      prompt:
        '3D Pixar-style animated character portrait of this person laughing out loud, eyes squeezed shut with joy, mouth wide open, tears of laughter, rosy cheeks, expressive and warm, soft studio lighting, smooth skin, big expressive features',
    },
    photomaker: {
      prompt:
        'a photo of a person img as an emoji style character laughing out loud, round emoji head, simple expressive features, mouth wide open, eyes squeezed shut, tears of laughter, rosy cheeks, bright happy glow, emoji character style',
      negative:
        'realistic, photorealistic, complex, detailed skin, human, sad, serious, no smile',
    },
  },
  disheveled: {
    pixar: {
      prompt:
        '3D Pixar-style animated character portrait of this person just woken up, hair sticking out in every direction, sleepy half-closed eyes, puffy face, pillow crease on cheek, yawning, cozy morning light, funny and charming',
    },
    photomaker: {
      prompt:
        'a photo of a person img as an emoji style character rudely woken up, round emoji head, simple expressive features, messy bed hair sticking out in all directions, sleepy half-closed eyes, puffy face, pillow crease on cheek, emoji character style',
      negative:
        'realistic, photorealistic, complex, detailed skin, human, neat hair, awake, energetic, formal',
    },
  },
};
