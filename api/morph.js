// Mymoji morph handler: routes each request to Instant-ID (realistic) or Photomaker (emoji).
const REPLICATE = 'https://api.replicate.com/v1/predictions';

// Model version hashes come from env vars. Copy them from each model's Replicate page (API tab).
// Input field names differ per model, so check them against that API tab.
const INSTANT_ID_IMAGE_FIELD = 'image';
const PHOTOMAKER_IMAGE_FIELD = 'input_image';

const NEG_COMMON = 'blurred, low quality';

// ---- Newer emoji: prompts live in new_emoji_prompts.js (deploy both files together) ----
// Prompts for the newer emoji, keyed by name (mapped to emoji characters in NEW_EMOJI below).
// Each entry holds one block per model: { prompt, negative }. Kontext/Pixar take no negative.
const NEW_EMOJI_PROMPTS = {
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
const normEmoji = (e) => String(e).replace(/\uFE0F/g, '');
const NEW_EMOJI = {};
[
  ['🐦‍🔥', 'phoenix'],
  ['🦈', 'shark'],
  ['🦑', 'kraken'],
  ['👽', 'alien'],
  ['🥶', 'very_cold'],
  ['🦄', 'unicorn'],
  ['👹', 'frankenstein'],
  ['🧟', 'zombie'],
  ['🏴‍☠️', 'pirate'],
  ['🧞', 'genie'],
  ['🤔', 'philosopher'],
  ['🤣', 'laughing_out_loud'],
  ['🥱', 'disheveled'],
].forEach(([ch, name]) => { NEW_EMOJI[normEmoji(ch)] = name; });

function newEntry(emoji) {
  const name = NEW_EMOJI[normEmoji(emoji)];
  return name ? NEW_EMOJI_PROMPTS[name] || null : null;
}

// ---- FLUX Kontext routing ----
const KONTEXT_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions';
const KEEP = 'Keep this exact person\'s face identity, facial structure, skin tone and hair recognizable. Edit this photo: ';
const EMOJI_LOOK = ' Then completely restyle the whole image as a cute 3D cartoon emoji character: smooth glossy plastic-like skin, big expressive cartoon eyes, simplified rounded features, bold clean outlines, vivid saturated colors, plain white background, like a Pixar-style sticker. It must not look like a photograph. Keep the hairstyle and hair color so it is still recognizably this person.';
const PIXAR_LOOK = ' Then restyle the whole image as a Pixar-style 3D animated movie character portrait: soft smooth skin, large expressive eyes, gentle rounded features, warm cinematic lighting, vibrant colors, clean plain background. Keep the face clearly recognizable as this same person, with the same hairstyle, hair color and skin tone. It must not look like a photograph.';

const K = {
  '🐭': 'turn the person into a rat-headed character: gray and white fur covering the whole head, small pointed rat ears on the sides, whiskers, a small pink rodent nose, beady bright eyes.',
  '🐯': 'turn the person into a tiger-headed character: orange fur with black stripes covering the whole head, pointed tiger ears, whiskers, small pink nose, fierce golden eyes.',
  '🐶': 'turn the person into a dog-headed character: warm brown and tan fur covering the whole head, floppy dog ears, a dog snout and dog nose, friendly alert expression.',
};
// Kontext replaces BOTH styles for these emojis; every other Kontext emoji
// replaces only the "realistic" (Instant-ID) style.
const KONTEXT_BOTH = new Set();

// These emoji use Instant-ID only (no Kontext, no Pixar)
const INSTANT_ID_ONLY = new Set(['🐍', '🧙', '🧛', '🧚', '🤡', '😇', '😈', '👑']);

function kontextPrompt(emoji, style) {
  const key = String(emoji).replace(/\uFE0F/g, '');
  const fresh = newEntry(emoji);
  if (fresh) {
    if (style === 'emoji') return null; // PhotoMaker handles the emoji style
    const block = fresh.kontext || fresh.pixar;
    return block ? block.prompt : null; // no Kontext/Pixar block: InstantID
  }
  if (INSTANT_ID_ONLY.has(key)) return null;

  const p = T[key];
  if (!p) return null;
  const k = K[key];
  if (style === 'emoji') {
    if (!k || !KONTEXT_BOTH.has(key)) return null;
    return KEEP + k + EMOJI_LOOK;
  }
  return KEEP + (k || 'give this person the facial expression of ' + (p[0].split(',')[0]) + '.') + PIXAR_LOOK;
}

// emoji: [instantIdPrompt, instantIdNegative, photomakerPrompt, photomakerNegative]
const T = {
  '😠': [
    'a person with an extremely angry furious scarlet red shaded expression, deeply furrowed brow angled sharply downward in a scowl, piercing blazing eyes filled with rage and fire, scowling mouth with a fierce grimace, face completely flushed bright crimson red with intense emotion, angry emoji character, vibrant red and orange tones, bold fierce expression, clean smooth skin',
    'sad, happy, smiling, calm, neutral expression, peaceful, serene, soft features, composed, pastel colors, realistic human, blurred, low quality, cute, friendly, scar, wound, demon, marks, shocked, surprised, gasping, screaming, bruise, gash, blemish, dark spot, shadow on face',
    'a photo of an angry red emoji style face img, bright red and orange tones, exaggerated angry expression, maximum intensity, furrowed brow, sharp intense eyes, gritted teeth, fierce and bold, emoji character style, vibrant and saturated colors',
  ],
  '😀': [
    'a person with a joyful bright happy expression, wide genuine smile showing teeth, sparkling eyes full of warmth and delight, radiant glowing face, rosy cheeks, golden yellow emoji character, vibrant warm sunny tones, bold expressive joyful expression, clean smooth skin',
    'sad, angry, frowning, neutral, calm, pale, pastel colors, realistic human, blurred, low quality, demon, marks, tired, exhausted, bored, disgusted',
    'a photo of a delighted emoji with a big cheerful smile img, sparkling eyes, rainbow colors, cartoonish joy, no realistic facial details',
  ],
  '😢': [
    'a person with a sorrowfully sad expression, downturned mouth and drooping frown, very sad eyes, soft gentle sad gaze, blue hair, face with pale skin tone, gentle sad expression, clean smooth skin, emotional vulnerable look',
    'happy, angry, smiling, laughing, excited, bright, warm colors, realistic human, blurred, low quality, demon, marks, playful, silly, vibrant',
    'a photo of a sad blue emoji character img, bright blue and cyan tones with white highlights, round emoji face with defined features, large expressive round eyes with sad gaze and tear streaks, prominent downturned mouth with a clear sad frown showing emotion, textured emoji skin with visible shading and depth, bold expressive sad expression, no realistic human features, pure cartoon emoji character style, vibrant saturated colors, surrounded by soft blue glow or mist',
  ],
  '😮': [
    'a person with a shocked surprised expression, wide eyes full of astonishment, raised eyebrows high in shock, open mouth in surprise, illuminated bright face, bright surprised tones, bold shocked expression, clean smooth skin',
    'calm, composed, neutral, sad, angry, closed mouth, peaceful, serene, pastel colors, realistic human, blurred, low quality, demon, marks, bored',
    'a photo of a shocked surprised expression emoji img, wide eyes full of astonishment, raised eyebrows high in shock, open mouth in surprise, illuminated bright face, white and light blue emoji character, bright surprised tones, bold shocked expression, clean smooth skin',
  ],
  '😕': [
    'a person with a very confused facial expression, head tilted to one side, very highly raised questioning right eyebrow, right eye slightly looking upward or sideways in uncertainty, left eye looking a different direction, squinting puzzled eyes, mouth curved in a confused questioning shape like a crooked line or upside-down smile, furrowed brow between the eyes showing doubt, perplexed uncertain look, clean smooth skin',
    'certain, confident, clear, happy, sad, angry, bright, vibrant, realistic human, blurred, low quality, demon, marks, sure, decisive',
    'A photo of a very confused expression emoji img, slightly furrowed brow questioning, tilted head, squinting thoughtful eyes, puzzled and uncertain look light purple emoji character, soft confused tones, gentle puzzled expression, clean smooth skin, bewildered questioning gaze',
  ],
  '😱': [
    'a person with a very terrified and scared expression, wide frightened eyes full of fear, raised eyebrows high in alarm, slightly open mouth of fear, pale white face, cold scared tones, frightened trembling expression, clean smooth skin, genuine terror look',
    'happy, calm, peaceful, brave, confident, warm colors, bright, realistic human, blurred, low quality, demon, marks, angry, playful',
    'a photo of a very scared expression emoji character img, wide frightened eyes full of fear, raised eyebrows high in alarm, slightly open mouth of fear, pale ghostly white face, cold scared tones, frightened trembling expression, clean smooth skin, genuine terror look',
  ],
  '🤢': [
    'a person with a disgusted repulsed green shaded expression, nose heavily wrinkled and scrunched in disgust, upper lip curled upward showing disdain, mouth slightly open showing distaste, eyes narrowed and squinting with disapproval, eyebrows lowered in revulsion, head slightly tilted back as if recoiling, expression of clear disgust and aversion, clean smooth skin',
    'happy, pleased, surprised, calm, peaceful, warm colors, bright, realistic human, blurred, low quality, demon, marks, loving, kind',
    'a photo of a very disgusted repulsed emoji img, wrinkled nose in disgust, curled upper lip showing disdain, squinting eyes of disapproval, slightly greenish-gray emoji character, sickly disgusted tones, repulsive expression, clean smooth skin, clearly revolted look',
  ],
  '🥰': [
    'a person with a loving adoring pink shaded expression, soft romantic eyes full of affection, gentle warm smile, rosy blushed face, warm loving romantic tones, tender affectionate expression, clean smooth skin, heart-eyes warmth',
    'angry, sad, scared, disgusted, cold, neutral, pale colors, realistic human, blurred, low quality, demon, marks, hostile, mean',
    'a photo of a very loving adoring emoji cartoon character img, soft romantic eyes full of affection, gentle warm smile, round rosy blushed face, bright pink and red emoji cartoon character, warm loving romantic tones, tender affectionate expression, clean smooth skin, heart-eyes warmth',
  ],
  '🤩': [
    'a person with an excited thrilled expression, wide sparkling eyes full of enthusiasm and energy, huge bright smile full of joy, face glowing with excitement, vibrant energetic excited tones, bold expressive excited expression, clean smooth skin, electrified energetic look',
    'sad, bored, tired, calm, neutral, pale, dull colors, realistic human, blurred, low quality, demon, marks, exhausted, depressed',
    'a photo of an excited thrilled expression emoji img, wide sparkling eyes full of enthusiasm and energy, huge bright smile full of joy, face glowing with excitement, bright neon yellow and orange emoji character style, vibrant energetic excited tones, bold expressive excited expression, clean smooth skin, electrified energetic look',
  ],
  '😳': [
    'a person with an embarrassed flustered expression, deeply blushed bright red cheeks, downcast eyes avoiding gaze, shy small smile, flustered look, warm pink and coral emoji character, embarrassed bashful tones, shy flustered expression, clean smooth skin, mortified self-conscious look',
    'proud, confident, bold, brave, composed, pale cheeks, realistic human, blurred, low quality, demon, marks, arrogant, fearless',
    'a photo of an embarrassed flustered emoji character img, deeply blushed bright red cheeks, downcast eyes avoiding gaze, shy small smile, flustered look, warm pink and coral emoji character style, embarrassed bashful tones, shy flustered expression, clean smooth skin, mortified self-conscious look',
  ],
  '🤪': [
    'a person with a playful silly expression, wide grinning smile full of mischief, bright sparkly playful eyes, tilted head of mischief, exaggerated goofy grin, fun playful silly tones, bold expressive playful expression, clean smooth skin, mischievous goofy look, silly tongue sticking out',
    'serious, angry, sad, composed, neutral, formal, pale colors, realistic human, blurred, low quality, demon, marks, strict, stern',
    'a photo of a playful silly expression character emoji img, wide grinning smile full of mischief, bright sparkly playful eyes, tilted head of mischief, exaggerated silly grin, tongue sticking out, bright rainbow and colorful emoji character style, fun playful silly tones, bold expressive playful expression, clean smooth skin, mischievous goofy look',
  ],
  '😪': [
    'a person with an extremely tired exhausted expression, drooping heavy eyes, slight dark circles under eyes, subtle frown or neutral mouth, pale grayish face, drained exhausted tones, weary fatigued expression, clean smooth skin, completely worn out look',
    'excited, happy, energetic, bright, alert, sharp eyes, warm colors, vibrant, realistic human, blurred, low quality, demon, marks, refreshed, energized',
    'a photo of an extremely tired exhausted emoji character img, drooping heavy eyes, slight dark circles under eyes, subtle frown open mouth, soft gray and pale purple emoji character style, drained exhausted tones, weary fatigued expression, clean smooth skin, completely worn out look',
  ],
  '👑': [
    'a person with a regal dignified expression, proud confident gaze, upright posture, royal bejeweled crown visible on head, noble and majestic look, composed graceful features, golden and royal purple warm tones, clean smooth skin, expression of authority and elegance',
    'sad, angry, frowning, casual, poor, weak, pale, dull colors, realistic human, blurred, low quality, demon, marks, undignified, slouching, timid',
    'a photo of a regal royal emoji head only character img, wearing a golden crown or tiara, proud dignified expression, confident upright bearing, golden and jewel-toned colors, luxurious royal aesthetic, sparkles or shine suggesting prestige, pure emoji character style, vibrant and majestic',
  ],
  '😇': [
    'a person with a peaceful serene angelic expression, soft gentle eyes full of warmth and kindness, serene calm gaze, halo of light around head, pure innocent look, divine peaceful features, pale golden silver white luminous tones, radiant glowing skin, expression of purity and grace, wide angel wings',
    'evil, demonic, angry, scowling, dark, shadowed, realistic human, blurred, low quality, demonic marks, sinister, malevolent, horns, wings of darkness',
    'a photo of an angelic emoji head only character img, with a visible halo around head, soft peaceful expression, gentle kind eyes, pale white and gold tones, luminous glowing skin, wings and light rays visible, divine serene aesthetic, pure emoji character style, vibrant and heavenly',
  ],
  '😈': [
    'a person with a menacing evil demonic expression, intense piercing eyes full of malevolence, sharp angular features, horns visible, scowling fierce grimace, dark sinister look, deep red and black tones, shadowed intense expression, expression of evil and darkness',
    'angelic, holy, peaceful, kind, smiling, bright, light, pastel colors, innocent, gentle, realistic human, blurred, low quality, serene, wings of light',
    'a photo of a demonic emoji head only character img, with horns or demonic features visible, menacing intense expression, piercing malevolent eyes, dark red and black tones with shadows, sharp angular emoji features, sinister evil aesthetic, demonic aura or dark energy surrounding, pure emoji character style, vibrant and dark',
  ],
  '🤡': [
    'a person with a playful mischievous joker expression, wide exaggerated grin, theatrical animated features, colorful joker makeup, laughing joyful eyes, bold expressive playful look, vibrant colorful tones, animated silly expression, expression of comedy and mischief',
    'serious, sad, angry, calm, neutral, boring, realistic human, blurred, low quality, demon, marks, composed, unfunny, dull colors, plain',
    'a photo of a playful joker emoji head only character img, round bold emoji face, wide exaggerated grin with a big smile, colorful rainbow and jewel tones with vibrant colors, theatrical silly expression, exaggerated animated features, jester elements visible, textured emoji skin with visible shading and depth, pure cartoon emoji character style, vibrant and hilarious, surrounded by playful mischievous aura or sparkles',
  ],
  '🧚': [
    'a person with an ethereal magical fae expression, delicate gentle features, mystical enchanting gaze, graceful serene look, fairy wings, magical gold dust elements suggested, magical glowing ethereal tones, luminous skin with subtle sparkle, ethereal peaceful expression, expression of magic and wonder',
    'evil, demonic, dark, shadowed, angry, realistic human, blurred, low quality, demon, marks, menacing, heavy, opaque, dull colors',
    'a photo of a magical fairy emoji head only character img, with visible fairy wings or magical sparkles, ethereal delicate expression, enchanting mystical gaze, pastel magical colors with luminous glows, whimsical magical aesthetic, surrounded by sparkles or magical aura, pure emoji character style, vibrant and enchanting',
  ],
  '🧙': [
    'a person with a mysterious wise witch expression, knowing intense gaze, sharp clever features, witchy mystical look, dark mystical tones, pointed hat, magical purple elements suggested, mysterious confident expression, wise enigmatic look, expression of magic and mystery',
    'angelic, holy, innocent, kind, peaceful, bright, pastel colors, realistic human, blurred, low quality, cheerful, silly, naive, weak',
    'a photo of a mysterious witch emoji head only character img, wearing a pointed witch hat, intense knowing gaze, sharp mysterious expression, dark purple and black tones with mystical colors, magical mystical aesthetic, surrounded by magical potion elements, pure emoji character style, vibrant and enigmatic',
  ],
  '🧛': [
    'a person that is a mysterious seductive vampire, very long vampire fangs, pale elegant features, intense piercing gaze, dark dramatic look, pointed vampire fangs, nocturnal mysterious aesthetic, pale white and deep red tones, dramatic intense expression, expression of mystery and darkness',
    'angelic, holy, alive, cheerful, bright, warm colors, innocent, realistic human, blurred, low quality, demon, silly, friendly, clownish',
    'a photo of a vampire emoji character img, pale white face with dark dramatic features, intense piercing gaze, visible vampire fangs, dark red and black gothic tones, cape or vampire attire elements, mysterious seductive aesthetic, nocturnal mystical vibe, pure emoji character style, vibrant and dramatic',
  ],
  '🐭': [
    'a person with a rat-shaped head, rat-shaped ears, rat-furred forehead, fully furred with gray and white fur covering the entire head including the forehead and face, small pointed rat ears positioned on the sides of the head, whiskers protruding from the snout and muzzle, beady sharp intelligent eyes, tiny cute rodent nose, sleek nimble rat appearance, mischievous playful expression, clean smooth fur with no exposed skin anywhere, pure rat face on human body below',
    'large, slow, dull eyes, fierce, aggressive, reptile, bird, realistic animal, blurred, low quality, angry, scary, ugly',
    'a photo of a cute rat emoji head-only character img, pink nose, long pink ears, white and gray fur, alert expression, whiskers, rodent features, stylized emoji illustration, bold character emoji design style, cartoonish friendly rat',
    'photorealistic, realistic rat, scary, creepy, gross, dirty, diseased, photorealistic rodent, cute mascot style, oversized ears, floppy ears, human face, exposed skin, photorealistic fur texture',
  ],
  '🐯': [
    'a person with a tiger-shaped head, tiger-shaped ears, tiger-furred forehead, fully furred with orange and black striped fur covering the entire head including the forehead and face, pointed tiger ears positioned on the sides of the head, whiskers protruding from the snout and muzzle, intense fierce golden eyes, small pink tiger nose, sleek powerful tiger appearance, fierce confident expression, clean smooth fur with no exposed skin anywhere, pure tiger face on human body below',
    'pale, timid, weak eyes, calm, peaceful, reptile, bird, realistic animal, blurred, low quality, friendly, gentle, cute',
    'a photo of a fierce tiger emoji head-only character img, orange and black stripes, alert predatory expression, pointed ears, tiger face, stylized emoji illustration, bold character emoji design style, vibrant orange tiger',
    'photorealistic, realistic tiger, scary, aggressive, photorealistic fur, realistic animal head, human face, exposed skin, cute mascot style, too many stripes, faded colors, pastel colors, soft colors',
  ],
  '🐉': [
    'a person transformed into a magnificent legendary dragon-shaped head, dragon-scaled forehead, fully scaled with shimmering gold and green scales covering the entire head including the forehead and face, pointed dragon horns positioned on top of the head, scales textured across the entire face, intense piercing eyes, bright golden scales and jewel tones, powerful commanding gaze, mystical wise expression, ornate elaborate features, divine majestic presence, regal triumphant look, shimmering scales, pure dragon face on human body below',
    'weak, dull, earthly, ordinary, realistic animal, blurred, low quality, timid, scared, ugly, boring, common',
    'a photo of a mythical dragon emoji head-only character emoji img, scales, pointed horns, fierce bold expression, dragon snout, vibrant colors, stylized emoji illustration, bold character emoji design style, fantasy dragon, magical creature emoji',
    'photorealistic, realistic dragon, scary horror, too dark, realistic scales, human face, exposed skin, cute mascot style, no horns, broken horns, soft colors, pastel, wimpy expression',
  ],
  '🐶': [
    'a person with a dog-shaped head with a snout, floppy dog ears, fully furred head with warm brown and tan fur covering the entire face, forehead, cheeks, nose and chin, dog snout and dog nose, dog fur texture throughout, clean thick fur with no exposed human skin on face, natural dog fur with no shine, pure dog face on human body below, alert dog expression',
    'human woman, human face, exposed human skin on cheeks, exposed human skin on forehead, stylized ears, fluffy hair, long hair, hair falling over face, cute ears with fur pom-poms, delicate ears, human nose, pink nose, lipstick, makeup, rosy cheeks, photorealistic dog, realistic dog head, cartoon dog, anime dog, ears on top of head floating away from face',
    'a photo of a happy dog head-only emoji character img, floppy ears, dog snout, warm brown and tan colors, friendly alert expression, dog face, stylized emoji illustration, bold character emoji design style, cheerful cartoon dog',
    'photorealistic, realistic dog, scary, aggressive, photorealistic fur, realistic animal head, human face, exposed skin, human features, standing ears, pointed ears, small ears, photorealistic dog head',
  ],
  '🐍': [
    'a person with a medusa head covered entirely in living snakes, serpent hair writhing, intense piercing gaze, pale skin tone, dramatic expression, snake scales on forehead and cheeks, serpent fangs visible, multiple snakes intertwined covering the entire head, dark mysterious vibe, medusa face on human body below, natural skin tone neck',
    'human hair, human woman, exposed skin on forehead, exposed skin on cheeks, rosy cheeks, lipstick, makeup, cute expression, friendly expression, realistic snakes, photorealistic, cartoon snakes, anime character, no snakes, bald, smooth hair, long flowing hair, delicate features, smiling',
    'a photo of a medusa head-only emoji character img, intense angry gaze, snake scales, dramatic mythical creature, stylized emoji illustration, colorful snakes, bold expression, character emoji design style',
    'photorealistic, realistic snakes, human woman, cute, friendly, smiling, cartoon style mascot, soft colors, pastel, delicate, no snakes, bald',
  ],
  '😎': [
    'a confident cool person with stylish dark sunglasses, sleek fashionable hair, bold movie star expression, charismatic presence, sophisticated glamorous look, red carpet ready, confident smirk, cool iconic celebrity vibe, sunglasses on face, pure confident person on human body below, natural skin tone',
    'cute, innocent, vulnerable, scared, angry, sad, weak expression, messy hair, unkempt, rosy cheeks, lipstick, makeup, photorealistic, cartoon character, anime, no sunglasses, sunglasses too small, sunglasses off center, closed eyes, eyes hidden by sunglasses',
    'a photo of a cool confident emoji character img, dark sunglasses, movie star glamorous, sleek stylish hair, bold confident expression, celebrity vibe, fashionable, bold character emoji design style, iconic cool look',
    'photorealistic, cute mascot, baby, innocent, vulnerable, sad, weak, angry, messy, unkempt, no sunglasses, sunglasses removed, cartoon mascot style, soft colors, closed eyes, eyes hidden',
  ],
  '😭': [
    'a person with an anguished distraught face, tears streaming down cheeks, mouth open in despair, deeply furrowed brow, red puffy eyes, dramatic emotional expression, full face covered in tears, raw vulnerability, devastated expression, upset face on human body below, natural skin tone',
    'smiling, happy, peaceful, calm, closed eyes, sleeping, angry, furious, confused, surprised, soft delicate features, makeup, lipstick, rosy cheeks, feminine, photorealistic, cartoon character, anime, minimalist expression, blood',
    'a photo of a crying upset emoji character img, tears streaming, anguished broken expression, devastated emotional, heartbroken look, dramatic character emoji design style, bold sad character design, raw emotion',
    'photorealistic, happy, smiling, calm, peaceful, closed eyes, sleeping, angry, furious, confused, surprised, cute mascot, cartoon style, soft colors, delicate',
  ],
  '🤓': [
    'a sharp intelligent person with thick black-rimmed eyeglasses, confident thoughtful gaze, alert bright eyes, clean professional appearance, intellectual vibe, clever composed expression, focused mind expression, pure intelligent person on human body below, natural skin tone',
    'confused, dumb, silly, distracted, unfocused, scattered, messy hair, unkempt, casual sloppy, weak expression, uncertain, scared, angry, sad, cute, baby face, photorealistic, cartoon character, anime, no glasses, glasses too big, glasses too small, glasses off center, closed eyes',
    'a photo of a smart genius emoji character img, stylish glasses, intelligent focused expression, bright alert eyes, confident thoughtful look, intellectual vibe, clever clever character emoji design style, professional smart design',
    'photorealistic, confused, dumb, silly, distracted, unfocused, messy, unkempt, casual sloppy, weak, uncertain, scared, angry, sad, cute, baby, no glasses, glasses off center, cartoon mascot style, soft colors',
  ],
};

function lookup(emoji) {
  const fresh = newEntry(emoji);
  if (fresh) {
    return {
      idPrompt: fresh.instantid ? fresh.instantid.prompt : '',
      idNeg: fresh.instantid ? fresh.instantid.negative : '',
      pmPrompt: fresh.photomaker.prompt,
      pmNeg: fresh.photomaker.negative || '',
    };
  }
  const e = T[String(emoji).replace(/\uFE0F/g, '')] || T[emoji];
  if (!e) return null;
  // Entries with 3 items share one negative between both styles.
  return {
    idPrompt: e[0],
    idNeg: e[1],
    pmPrompt: e[2],
    pmNeg: e[3] || e[1],
  };
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function runPrediction(version, input, url) {
  const r = await fetch(url || REPLICATE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify(url ? { input } : { version, input }),
  });
  let p = await r.json();
  if (!r.ok) throw new Error(p.detail || `Replicate error ${r.status}`);
  while (p.status === 'starting' || p.status === 'processing') {
    await new Promise((ok) => setTimeout(ok, 1500));
    const g = await fetch(p.urls.get, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
    });
    p = await g.json();
  }
  if (p.status !== 'succeeded') throw new Error(p.error || `Prediction ${p.status}`);
  return Array.isArray(p.output) ? p.output[0] : p.output;
}

// ---- Artify: one plan per painter (Instant-ID or fofr/face-to-many) ----
// Optional env FACE_TO_MANY_VERSION overrides this default version hash.
const FACE_TO_MANY_DEFAULT_VERSION = 'a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8deaf';
const ART_NEG = 'photo, photograph, realistic skin texture, blurry, low quality, pixelated, compression artifacts, noise, extra fingers, watermark, text';
const ART_NEG_F2M = 'blurry, low quality, compression artifacts, noise';
const ART_NEG_F2M_PIXEL = 'blurry, low quality, pixelated, compression artifacts, noise';
const ARTIST_PLAN = {
  warhol: { model: 'instantid', prompt: 'a silkscreen pop art portrait of a person in the style of Andy Warhol, flat bold neon colors, high contrast, off-register color blocks, 1960s graphic art' },
  rembrandt: { model: 'instantid', prompt: 'a Baroque portrait of a person in the style of Rembrandt, warm chiaroscuro lighting, deep brown shadows, glowing highlights on the face, rich oil texture' },
  invader: { model: 'f2m', style: '3D', negative: ART_NEG_F2M, prompt: 'the whole portrait of a person in the French street artist Invader style, built from square pixel mosaic tiles in a limited bold palette, like tiled street art.' },
  dali: { model: 'instantid', strength: 1.0, prompt: 'a surrealist oil painting of a person in the style of Salvador Dalí, dreamlike melting forms, vast empty desert landscape, hyper-detailed rendering' },
  kahlo: { model: 'instantid', prompt: 'a self-portrait of a person in the style of Frida Kahlo, frontal gaze, bold saturated colors, lush leaves and flowers, introspective mood' },
  gaudi: { model: 'instantid', prompt: 'a mosaic portrait of a person in the style of Antoni Gaudí, trencadís broken-tile mosaic, organic flowing curves, vivid ceramic colors, Sagrada Família-inspired ornament' },
  picasso: { model: 'instantid', prompt: 'a cubist portrait of a person in the style of Pablo Picasso, face seen from several viewpoints, geometric planes, bold black outlines' },
  lempicka: { model: 'instantid', prompt: 'an Art Deco portrait of a person in the style of Tamara de Lempicka, sleek polished skin, geometric folds, metallic sheen, dramatic side lighting' },
  munch: { model: 'instantid', strength: 1.0, prompt: 'an expressionist painting of a person in the style of Edvard Munch\'s The Scream, anguished expression, swirling blood-orange sky, wavy landscape' },
  klimt: { model: 'instantid', prompt: 'a golden Art Nouveau painting of a person in the style of Gustav Klimt, gold leaf, ornate mosaic patterns, swirling decorative robes' },
  qibaishi: { model: 'instantid', prompt: 'a traditional Chinese ink-wash painting of a person in the style of Qi Baishi, lively black brushwork, touch of red accent, white rice paper background' },
  hokusai: { model: 'instantid', prompt: 'a Japanese ukiyo-e woodblock print of a person in the style of Katsushika Hokusai, bold outlines, Prussian blue tones, great wave motif' },
  vangogh: { model: 'instantid', prompt: 'a post-impressionist oil painting of a person in the style of Vincent van Gogh, thick swirling impasto brushstrokes, vibrant blues and yellows, starry night sky' },
  davinci: { model: 'instantid', prompt: 'a Renaissance oil portrait of a person in the style of Leonardo da Vinci, soft sfumato shading, calm enigmatic expression, hazy distant landscape' },
  renoir: { model: 'instantid', prompt: 'an Impressionist portrait of a person in the style of Pierre-Auguste Renoir, soft feathery brushstrokes, dappled warm light, rosy skin tones, gentle joyful mood' },
  boldini: { model: 'instantid', prompt: 'a society portrait of a person in the style of Giovanni Boldini, loose flowing brushwork, luminous elegant fabrics, soft romantic lighting' },
  vermeer: { model: 'instantid', prompt: 'a Dutch Golden Age portrait of a person in the style of Johannes Vermeer, soft window light, dark neutral background, luminous pearl earring' },
  sargent: { model: 'instantid', prompt: 'a society portrait of a person in the style of John Singer Sargent, confident bold brushwork, dark elegant background, crisp highlights, refined composure' },
  lichtenstein: { model: 'f2m', style: '3D', negative: ART_NEG_F2M_PIXEL, prompt: 'a Roy Lichtenstein style comic book pop art panel with thick black outlines of a person, Ben-Day dots and flat primary colors.' },
  degas: { model: 'instantid', prompt: 'a pastel portrait of a person in the style of Edgar Degas, soft chalky pastel strokes, loose sketched lines, off-centre composition, theatrical light' },
  murakami: { model: 'instantid', prompt: 'a superflat pop portrait of a person in the style of Takashi Murakami, glossy bright colors, smiling rainbow flowers, anime-inspired cheer' },
  modigliani: { model: 'instantid', prompt: 'a modernist portrait of a person in the style of Amedeo Modigliani, elongated neck and face, almond-shaped eyes, simplified smooth forms, warm ochre and cream tones' },
  raphael: { model: 'instantid', prompt: 'a High Renaissance portrait of a person in the style of Raphael, harmonious balanced composition, soft graceful modelling, serene idealized features, warm golden landscape' },
  gauguin: { model: 'instantid', prompt: 'a post-Impressionist painting of a person in the style of Paul Gauguin, flat areas of bold colour, thick dark outlines, warm tropical palette, saturated colour blocks, decorative Synthetist simplicity' },
};

// ---- Clay style (fofr/face-to-many) replaces Pixar for these expressions ----
// angry, happy, sad, confused, scared, disgusted, in love, excited,
// embarrassed, playful, tired, very upset, disheveled
const CLAY_EMOJI = new Set(['😠', '😀', '😢', '😕', '😱', '🤢', '🥰', '🤩', '😳', '🤪', '😪', '😭', '🥱']);
const CLAY_DISHEVELED_PROMPT = 'a clay character portrait of a person just woken up, hair sticking out in every direction, sleepy half-closed eyes, puffy face, pillow crease on cheek, yawning';
const CLAY_DISHEVELED_NEG = 'blurry, low quality, compression artifacts, noise, neat hair, awake, energetic, formal';
const CLAY_NEG = 'blurry, low quality, compression artifacts, noise';

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, version: 'clay-restored-v5', clayEmojiCount: CLAY_EMOJI.size, artistCount: Object.keys(ARTIST_PLAN).length });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    if (!process.env.REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN is not set on Vercel');
    const { photo_base64, emojis, styles, artist } = req.body || {};
    if (artist) {
      const plan = ARTIST_PLAN[artist];
      if (!photo_base64 || !plan) {
        return res.status(400).json({ error: `Unknown artist or missing photo: ${artist}` });
      }
      const artImage = photo_base64.startsWith('data:')
        ? photo_base64
        : `data:image/jpeg;base64,${photo_base64}`;
      let artUrl;
      if (plan.model === 'instantid') {
        if (!process.env.INSTANT_ID_VERSION) throw new Error('INSTANT_ID_VERSION is not set on Vercel');
        artUrl = await runPrediction(process.env.INSTANT_ID_VERSION, {
          [INSTANT_ID_IMAGE_FIELD]: artImage,
          prompt: plan.prompt,
          negative_prompt: plan.negative || ART_NEG,
          ip_adapter_scale: plan.strength,
        });
      } else {
        artUrl = await runPrediction(
          process.env.FACE_TO_MANY_VERSION || FACE_TO_MANY_DEFAULT_VERSION,
          {
            image: artImage,
            style: plan.style,
            prompt: plan.prompt,
            negative_prompt: plan.negative,
          },
        );
      }
      const artBuf = Buffer.from(await (await fetch(artUrl)).arrayBuffer());
      return res.status(200).json({ image_base64: artBuf.toString('base64') });
    }
    if (!photo_base64 || !Array.isArray(emojis) || emojis.length === 0) {
      return res.status(400).json({ error: 'photo_base64 and emojis are required' });
    }

    const emoji = emojis[0];
    const prompts = lookup(emoji);
    if (!prompts) return res.status(400).json({ error: `No prompt defined for emoji ${emoji}` });

    const style = Array.isArray(styles) && styles[0] === 'emoji' ? 'emoji' : 'pixar';
    const image = photo_base64.startsWith('data:')
      ? photo_base64
      : `data:image/jpeg;base64,${photo_base64}`;

    let outputUrl;
    const isClay = style === 'pixar' && CLAY_EMOJI.has(normEmoji(emoji));
    const kPrompt = isClay ? null : kontextPrompt(emoji, style);
    if (kPrompt) {
      outputUrl = await runPrediction(null, {
        prompt: kPrompt,
        input_image: image,
        output_format: 'jpg',
        safety_tolerance: 2,
      }, KONTEXT_URL);
    } else if (isClay) {
      const isDisheveled = normEmoji(emoji) === '🥱';
      outputUrl = await runPrediction(
        process.env.FACE_TO_MANY_VERSION || FACE_TO_MANY_DEFAULT_VERSION,
        {
          image,
          style: 'Clay',
          prompt: isDisheveled ? CLAY_DISHEVELED_PROMPT : 'a clay character portrait, ' + prompts.idPrompt,
          negative_prompt: isDisheveled
            ? CLAY_DISHEVELED_NEG
            : (prompts.idNeg ? prompts.idNeg + ', ' + CLAY_NEG : CLAY_NEG),
        },
      );
    } else if (style === 'emoji') {
      if (!process.env.PHOTOMAKER_VERSION) throw new Error('PHOTOMAKER_VERSION is not set on Vercel');
      outputUrl = await runPrediction(process.env.PHOTOMAKER_VERSION, {
        [PHOTOMAKER_IMAGE_FIELD]: image,
        prompt: prompts.pmPrompt,
        negative_prompt: prompts.pmNeg ? `${prompts.pmNeg}, ${NEG_COMMON}` : NEG_COMMON,
        num_outputs: 1,
      });
    } else {
      if (!process.env.INSTANT_ID_VERSION) throw new Error('INSTANT_ID_VERSION is not set on Vercel');
      outputUrl = await runPrediction(process.env.INSTANT_ID_VERSION, {
        [INSTANT_ID_IMAGE_FIELD]: image,
        prompt: prompts.idPrompt,
        negative_prompt: prompts.idNeg || NEG_COMMON,
      });
    }

    const img = await fetch(outputUrl);
    const buf = Buffer.from(await img.arrayBuffer());
    return res.status(200).json({ image_base64: buf.toString('base64') });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
