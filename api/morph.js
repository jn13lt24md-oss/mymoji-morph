// Mymoji morph handler.
// Emoji: every emoji runs on PhotoMaker-style with the prompt list below.
// Artify: one plan per painter (PuLID, Instant-ID, FLUX Kontext or face-to-many).
const REPLICATE = 'https://api.replicate.com/v1/predictions';

// Model version hashes come from env vars (copy them from each model's Replicate API tab).
const INSTANT_ID_IMAGE_FIELD = 'image';
const PHOTOMAKER_IMAGE_FIELD = 'input_image';
const NEG_COMMON = 'blurred, low quality';

const normEmoji = (e) => String(e).replace(/\uFE0F/g, '');

// ---------------------------------------------------------------------------
// Emoji prompts: [emoji character, prompt, negative prompt]
// Grouped as: feelings, characters and costumes, creatures, animals,
// weather and objects, then people and franchise characters.
// ---------------------------------------------------------------------------
const EMOJI_PROMPTS = [
  // ===== FEELINGS =====
  ['😠',
    `a photo of a head-only very angry red-faced person img, 3d CGI, art by Pixar, bright red and orange tones, exaggerated angry expression, maximum intensity, furrowed brow, sharp intense eyes, gritted teeth, fierce and bold, vibrant and saturated colors`,
    `sad, happy, smiling, calm, neutral expression, peaceful, serene, soft features, composed, pastel colors, realistic human, blurred, low quality, cute, friendly, scar, wound, demon, marks, shocked, surprised, gasping, screaming, bruise, gash, blemish, dark spot, shadow on face`],
  ['😀',
    `a photo of a head-only very delighted person with a big cheerful smile img, 3d CGI, art by Pixar, sparkling eyes, bright happy colors, cartoonish joy, no realistic facial details`,
    `sad, angry, frowning, neutral, calm, pale, pastel colors, realistic human, blurred, low quality, demon, marks, tired, exhausted, bored, disgusted`],
  ['😢',
    `a photo of a head-only extremely sad person img, 3d CGI, art by Pixar, large expressive round eyes with sad gaze and tear streaks, prominent downturned mouth with a clear sad frown showing emotion, bold expressive sad expression`,
    `happy, angry, smiling, laughing, excited, bright, warm colors, realistic human, blurred, low quality, demon, marks, playful, silly, vibrant`],
  ['😮',
    `a photo of a head-only very shocked and surprised person img, 3d CGI, art by Pixar, wide eyes full of astonishment, raised eyebrows high in shock, open mouth in surprise, illuminated bright face, bright surprised tones, bold shocked expression, clean smooth skin`,
    `calm, composed, neutral, sad, angry, closed mouth, peaceful, serene, pastel colors, realistic human, blurred, low quality, demon, marks, bored`],
  ['😕',
    `A photo of a head-only very confused person img, 3d CGI, art by Pixar, slightly furrowed brow questioning, tilted head, squinting thoughtful eyes, puzzled and uncertain look, soft confused tones, gentle puzzled expression, clean smooth skin, bewildered questioning gaze`,
    `certain, confident, clear, happy, sad, angry, bright, vibrant, realistic human, blurred, low quality, demon, marks, sure, decisive`],
  ['😱',
    `a photo of a head-only very scared and extremely terrified person img, 3d CGI, art by Pixar, wide frightened eyes full of fear, raised eyebrows high in alarm, slightly open mouth of fear, pale clammy white face, cold scared tones, frightened trembling expression, clean smooth skin, genuine terror look`,
    `happy, calm, peaceful, brave, confident, warm colors, bright, realistic human, blurred, low quality, demon, marks, angry, playful`],
  ['🤢',
    `a photo of a head-only very disgustedly repulsed person img, 3d CGI, art by Pixar, wrinkled nose in disgust, curled upper lip showing disdain, squinting eyes of disapproval, slightly greenish-gray sickly disgusted tones, repulsive expression, clean smooth skin, clearly revolted look`,
    `happy, pleased, surprised, calm, peaceful, warm colors, bright, realistic human, blurred, low quality, demon, marks, loving, kind`],
  ['🥰',
    `a photo of a head-only very loving and adoring person img, 3d CGI, art by Pixar, soft romantic eyes full of affection, gentle warm smile, round rosy blushed face, bright pink and red warm loving romantic tones, tender affectionate expression, clean smooth skin, heart-eyes warmth`,
    `angry, sad, scared, disgusted, cold, neutral, pale colors, realistic human, blurred, low quality, demon, marks, hostile, mean`],
  ['🤩',
    `a photo of head-only very excitedly thrilled person img, 3d CGI, art by Pixar, wide sparkling eyes full of enthusiasm and energy, huge bright smile full of joy, face glowing with excitement, bright neon yellow and orange vibrant energetic excited background tones, bold expressive excited expression, clean smooth skin, electrified energetic look`,
    `sad, bored, tired, calm, neutral, pale, dull colors, realistic human, blurred, low quality, demon, marks, exhausted, depressed`],
  ['😳',
    `a photo of a heads-only very embarrassed flustered person img, 3d CGI, art by Pixar, deeply blushed bright red cheeks, downcast eyes avoiding gaze, shy small smile, flustered look, warm pink and coral embarrassed bashful tones, shy flustered expression, clean smooth skin, mortified self-conscious look`,
    `proud, confident, bold, brave, composed, pale cheeks, realistic human, blurred, low quality, demon, marks, arrogant, fearless`],
  ['🤪',
    `a photo of a heads-only playful and silly person img, 3d CGI, art by Pixar, wide grinning smile full of mischief, bright sparkly playful eyes, tilted head of mischief, exaggerated silly grin, tongue sticking out, bright colorful fun playful silly tones, bold expressive playful expression, clean smooth skin, mischievous goofy look`,
    `serious, angry, sad, composed, neutral, formal, pale colors, realistic human, blurred, low quality, demon, marks, strict, stern`],
  ['😪',
    `a photo of an extremely tired exhausted person img, 3d CGI, art by Pixar, drooping heavy eyes, slight dark circles under eyes, subtle frown open mouth, soft gray and pale tinged face, drained exhausted tones, weary fatigued expression, clean smooth skin, completely worn out look`,
    `excited, happy, energetic, bright, alert, sharp eyes, warm colors, vibrant, realistic human, blurred, low quality, demon, marks, refreshed, energized`],
  ['😭',
    `a photo of a crying upset person img, 3d CGI, art by Pixar, tears streaming, anguished broken expression, devastated emotional, heartbroken look, dramatic character, bold sad character design, raw emotion`,
    `photorealistic, happy, smiling, calm, peaceful, closed eyes, sleeping, angry, furious, confused, surprised, cute mascot, cartoon style, soft colors, delicate`],
  ['🤣',
    `a photo of a head-only laughing out loud person img, 3d CGI, art by Pixar, simple expressive features, mouth wide open, eyes squeezed shut, tears of laughter, rosy cheeks, bright happy glow`,
    `realistic, photorealistic, complex, detailed skin, human, sad, serious, no smile`],
  ['🥶',
    `a photo of an almost frozen with severe frostbite person img, 3d CGI, art by Pixar, pale icy blue and white skin, blue lips, severe cold shivering expression, frost breath, harsh cold blue lighting, snowstorm background`,
    `warm, sunny, tropical, healthy, rosy, glowing skin, no ice, no frostbite, sweating, fire, heat, colorful, vibrant, summer`],
  ['🥱',
    `a head-only photo of a rudely-awakened from deep-sleep person img, 3d CGI, art by Pixar, simple expressive features, messy bed hair sticking out in all directions, sleepy half-closed eyes, puffy face, pillow crease on cheek`,
    `realistic, photorealistic, complex, detailed skin, human, neat hair, awake, energetic, formal`],
  ['🤒',
    `a portrait of a sick person with very high fever img, 3D CGI, art by Pixar, flushed skin, feverish expression, sweating, soft indoor lighting`,
    `healthy, happy, energetic, dull, chaotic, playground`],
  ['🌶️',
    `a portrait of a person who just ate something very spicy img, 3d CGI, art by Pixar, flushed face, tears, sweating, intense expression, mouth on fire`,
    `calm, neutral, happy, no tears, no sweat, dull, chaotic, playground`],
  ['🫠',
    `a portrait of a head-only person melting from a heatwave img, 3d CGI, art by Pixar, sweaty and shiny skin, drooping expression, hot sunlight, heat waves`,
    `cool, calm, dry skin, happy, no sweat, dull, chaotic, playground, facial hair`],
  ['😴',
    `a portrait of a very sleepy person img, 3D CGI, art by Pixar, yawning, half-closed eyes, hand over mouth, soft lighting`,
    `awake, energetic, alert, happy, no yawning, dull, chaotic, playground, facial hair`],
  ['🧩',
    `a portrait of a face cracked into pieces like a puzzle img, 3D CGI, art by Pixar, broken puzzle pieces/skin effect, shocked expression`,
    `normal face, no cracks, smiling, calm, dull, chaotic, playground`],

  // ===== CHARACTERS AND COSTUMES =====
  ['👑',
    `a photo of a regal royal head-only img, 3d CGI, art by Pixar, wearing a golden crown or tiara, proud dignified expression, confident upright bearing, golden and jewel-toned colors, luxurious royal aesthetic, sparkles or shine suggesting prestige, vibrant and majestic`,
    `sad, angry, frowning, casual, poor, weak, pale, dull colors, realistic human, blurred, low quality, demon, marks, undignified, slouching, timid`],
  ['😎',
    `a photo of a confident bold movie star img, 3d CGI, art by Pixar, with stylish designer sunglasses, fashionable hair, charismatic presence, sophisticated glamorous look, red carpet ready, confident smile, iconic celebrity vibe, natural skin tone`,
    `photorealistic, cute mascot, baby, innocent, vulnerable, sad, weak, angry, messy, unkempt, no sunglasses, sunglasses removed, cartoon mascot style, soft colors, closed eyes, eyes hidden`],
  ['🤓',
    `a photo of a sharp intelligent person img, 3d CGI, art by Pixar, stylish glasses or smart eyewear, confident thoughtful gaze, alert bright eyes, clean professional appearance, intellectual vibe, clever composed expression, focused mind expression, natural skin tone`,
    `photorealistic, confused, dumb, silly, distracted, unfocused, messy, unkempt, casual sloppy, weak, uncertain, scared, angry, sad, cute, baby, no glasses, glasses off center, cartoon mascot style, soft colors`],
  ['🤔',
    `a portrait of a head-only intellect img, 3d CGI, art by Pixar, sharp knowing eyes, simple expressive features, laurel wreath on top of head, highly detailed`,
    `stupid, ignorant, silly, no glasses, dull, chaotic, playground`],
  ['🤡',
    `a photo of a head-only playful joker img, 3d CGI, art by Pixar, wide exaggerated grin with a big smile, colorful rainbow and jewel tones with vibrant colors, theatrical silly expression, exaggerated animated features, jester elements visible, textured emoji skin with visible shading and depth, vibrant and hilarious, surrounded by playful mischievous aura or sparkles`,
    `serious, sad, angry, calm, neutral, boring, realistic human, blurred, low quality, demon, marks, composed, unfunny, dull colors, plain`],
  ['🏴‍☠️',
    `a photo of a pirate img, 3d CGI, art by Pixar, tricorn hat, red bandana, gold earrings, sunset ship deck, adventurous grin`,
    `innocent, scholarly, fancy, modern, friendly, no weapons, clean, boring, facial hair`],
  ['🧞',
    `a head-only photo of a genie img, 3d CGI, art by Pixar, blue skin, gold turban with jewel, gold arm band, swirling magical smoke, glowing sparkles, mystical glow`,
    `realistic, human, plain, no magic, modern, desert, sad, ordinary`],
  ['🤠',
    `a portrait of a head-only country western img, 3D CGI, art by Pixar, confident expressive eyes, rugged sun-kissed skin, classic wide-brimmed brown cowboy hat, subtle western bandana around neck barely visible at the bottom, charming adventurous expression, warm cinematic lighting, highly detailed`,
    `modern baseball cap, helmet, sci-fi outfit, dull eyes, weak expression, distorted facial features, extra faces, full body, messy hat, blurry, low quality, chaotic background, facial hair`],
  ['💀',
    `a portrait of a head-only Día de los Muertos person img, 3D CGI, art by pixar, realistic, detailed sugar skull makeup, floral crown, traditional face paint, rich colors, highly detailed`,
    `plain face, no makeup, dull, chaotic, playground`],
  ['🍳',
    `a portrait of a head-only chef img, 3D CGI, art by Pixar, warm confident eyes, bright white puffy chef toque, clean white chef jacket collar barely visible at the bottom, playful culinary expert expression, subtle flour dust on cheeks, polished skin shading, professional studio lighting`,
    `cowboy hat, baseball cap, dirty uniform, greasy face, dull eyes, foolish expression, distorted facial features, facial hair, extra faces, full body, messy chef hat, blurry, low quality, chaotic background`],
  ['🔮',
    `a portrait of a warlock img, 3D CGI, art by Pixar, realistic fantasy style, glowing eyes, mystical aura, detailed hooded cloak, arcane symbols, highly detailed, cinematic lighting`,
    `stupid, ignorant, silly, no glasses, dull, chaotic, playground`],
  ['🤑',
    `a portrait of a newly-found rich person img, 3D CGI, art by Pixar, stylish and modern, wearing designer clothes, gold jewelry, sunglasses, confident smile, luxury lifestyle`,
    `poor, dirty, sad, tired, old, casual, no sunglasses, dull, chaotic, playground, facial hair`],
  ['🩺',
    `a professional nurse img, 3D CGI, art by Pixar, clean white nursing cap with a red medical cross, neatly styled hair, kind expressive eyes, warm reassuring smile, crisp white uniform collar, subtle medical details, polished professional appearance, highly detailed`,
    `cartoon, anime, flat, no nursing cap, no medical cross, messy appearance, sinister expression, dirty uniform, dull, chaotic, playground`],
  ['👮',
    `a police officer img, 3D CGI, art by Pixar, dark navy police cap with a silver badge, neatly styled hair, confident alert eyes, professional authoritative expression, navy uniform collar, polished silver insignia, realistic skin texture, highly detailed`,
    `cartoon, anime, flat, no police cap, no badge, messy appearance, civilian clothing, intimidating exaggerated expression, dull, chaotic, playground`],

  // ===== CREATURES =====
  ['😇',
    `a photo of an angel img, 3d CGI, art by Pixar, with a visible halo around head, soft peaceful expression, gentle kind eyes, pale white and gold tones, luminous glowing skin, wings and light rays visible, divine serene aesthetic, vibrant and heavenly`,
    `evil, demonic, angry, scowling, dark, shadowed, realistic human, blurred, low quality, demonic marks, sinister, malevolent, horns, wings of darkness`],
  ['😈',
    `a photo of a heads-only demonic person img, 3d CGI, art by Pixar, with horns or demonic features visible, menacing intense expression, piercing malevolent eyes, dark red and black tones with shadows, sharp angular emoji features, sinister evil aesthetic, demonic aura or dark energy surrounding, vibrant and dark`,
    `angelic, holy, peaceful, kind, smiling, bright, light, pastel colors, innocent, gentle, realistic human, blurred, low quality, serene, wings of light`],
  ['🧚',
    `photo of a magical fairy img, 3d CGI, art by Pixar, with visible fairy wings or magical sparkles, ethereal delicate expression, enchanting mystical gaze, pastel magical colors with luminous glows, whimsical magical aesthetic, surrounded by sparkles or magical aura, vibrant and enchanting`,
    `evil, demonic, dark, shadowed, angry, realistic human, blurred, low quality, demon, marks, menacing, heavy, opaque, dull colors`],
  ['🧙',
    `a photo of a head-only mysterious witch img, 3d CGI, art by Pixar, wearing a pointed witch hat, intense knowing gaze, sharp mysterious expression, dark purple and black tones with mystical colors, magical mystical aesthetic, surrounded by magical potion elements, vibrant and enigmatic`,
    `angelic, holy, innocent, kind, peaceful, bright, pastel colors, realistic human, blurred, low quality, cheerful, silly, naive, weak, pointy ears`],
  ['🧛',
    `a photo of a head-only vampire img, 3d CGI, art by Pixar, pale white face with dark dramatic features, intense piercing gaze, visible vampire fangs, dark red and black gothic tones, cape or vampire attire elements, mysterious seductive aesthetic, nocturnal mystical vibe, vibrant and dramatic`,
    `angelic, holy, alive, cheerful, bright, warm colors, innocent, realistic human, blurred, low quality, demon, silly, friendly, clownish`],
  ['🐉',
    `a person transformed into a magnificent legendary dragon-shaped head img, 3d CGI, art by Pixar, dragon-scaled forehead, fully scaled with shimmering gold and green scales covering the entire head including the forehead and face, pointed dragon horns positioned on top of the head, scales textured across the entire face, intense piercing eyes, bright golden scales and jewel tones, powerful commanding gaze, mystical wise expression, ornate elaborate features, divine majestic presence, regal triumphant look, shimmering scales, pure dragon face on human body below`,
    `photorealistic, realistic dragon, scary horror, too dark, realistic scales, human face, exposed skin, cute mascot style, no horns, broken horns, soft colors, pastel, wimpy expression`],
  ['🐍',
    `a photo of medusa img, 3d CGI, art by Pixar, the hair is made of snakes, intense angry gaze, snake scales, dramatic mythical creature, colorful snakes, bold expression`,
    `photorealistic, realistic snakes, human woman, cute, friendly, smiling, cartoon style mascot, soft colors, pastel, delicate, no snakes, bald`],
  ['🐦‍🔥',
    `a person transformed into a magnificent legendary phoenix-shaped head img, 3d CGI, art by Pixar, fiery orange, red and gold feathered texture on their skin and hair like flames rising upward, intense glowing ember eyes, a sharp pointed beak-like nose, small feathers along the cheekbones and jawline, skin glowing with warm firelight, Dark mystical background, cinematic portrait.`,
    `icy, frozen, blue, cold, water, extinguished, dull, grey, dead, plain feathers, human nose, ordinary eyes`],
  ['🦑',
    `a person transformed into a magnificent legendary kraken-shaped head img, 3d CGI, art by Pixar, dark teal skin with suckers, tentacles as hair, and glowing eyes. Stormy deep-sea mood, dramatic lighting.`,
    `bright, sunny, friendly, no tentacles, human hair, small, cute, peaceful, shallow water`],
  ['🦄',
    `a photo of a head-only unicorn img, 3d CGI, art by Pixar, pearly spiral horn on forehead, long pastel rainbow mane hair, glitter, sparkles, dreamy soft lighting, pastel background`,
    `realistic horse, dark colors, no horn, evil, demonic, sharp, aggressive, plain, no sparkle`],
  ['👹',
    `a photo of Frankenstein's monster img, 3d CGI, art by Pixar, green skin, flat-top head, neck bolts, stitched scars across forehead, heavy brow, moody gothic lighting`,
    `innocent, angelic, white, pure, good, kind, bright, halo`],
  ['🧟',
    `a photo of a post apocalyptic zombie img, 3d CGI, art by Pixar, pale grey-green skin, sunken eyes, torn skin, messy hair, dark circles, eerie fog`,
    `bright, sunny, happy, alive, human, no fangs, colorful, casual`],
  ['👽',
    `photo of a friendly alien img, 3d CGI, art by Pixar, smooth green skin, large glowing eyes, 2 small antennae, starry space background, neon glow`,
    `hostile, grey alien, scary, no antennae, human, realistic, dark, evil eyes, earthling`],
  ['🧜',
    `a portrait of a head-only mermaid img, 3D CGI, art by Pixar, enchanting eyes, shimmering aqua scales along temples and cheeks, flowing vibrant sea-green hair, delicate seashell crown, pearlescent skin highlights, magical underwater glow, highly detailed`,
    `fish body, full body, extra faces, distorted facial features, ugly, dull eyes, messy hair, dry skin, dull colors, blurry, low quality, chaotic background`],
  ['👻',
    `a portrait of a head-only friendly ghost img, 3D CGI, art by Pixar, recognizable facial features, large expressive glowing eyes, soft translucent pale-white skin, wispy ethereal edges around the head, subtle bluish spectral glow, playful mysterious expression, floating mist, highly detailed`,
    `horror, terrifying, gore, skull, skeletal face, decayed skin, hollow eyes, distorted face, extra faces, full body, dark muddy colors, blurry, low quality, chaotic background`],
  ['🐺',
    `a portrait of a lycan img, 3D CGI, art by Pixar, realistic fantasy style, wolf-like features, sharp teeth, fur, glowing eyes, dramatic lighting, highly detailed`,
    `cute, harmless, funny, cartoon, no fur, dull, chaotic, playground`],
  ['🤖',
    `a portrait of a robotic face img, 3D CGI, art by Pixar, metallic skin, glowing elements, tech details, futuristic`,
    `human skin, organic face, no metal, dull, chaotic, playground`],
  ['👺',
    `a portrait of a gremlin img, 3D CGI, art by Pixar, big ears, sharp teeth, expressive eyes, mischievous look`,
    `cute, harmless, human, no ears, calm, dull, chaotic, playground`],

  // ===== ANIMALS =====
  ['🐭',
    `a person with a rat-shaped head img, 3d CGI, art by Pixar, rat-shaped ears, rat-furred forehead, fully furred with gray and white fur covering the entire head including the forehead and face, small pointed rat ears positioned on the sides of the head, whiskers protruding from the snout and muzzle, beady sharp intelligent eyes, tiny cute rodent nose, sleek nimble rat appearance, mischievous playful expression, clean smooth fur with no exposed skin anywhere, pure rat face on human body below`,
    `photorealistic, realistic rat, scary, creepy, gross, dirty, diseased, photorealistic rodent, cute mascot style, oversized ears, floppy ears, human face, exposed skin, photorealistic fur texture`],
  ['🐯',
    `a person transformed into a tiger-shaped head img, 3d CGI, art by Pixar, tiger-shaped ears, tiger-furred forehead, fully furred with orange and black striped fur covering the entire head including the forehead and face, pointed tiger ears positioned on the sides of the head, whiskers protruding from the snout and muzzle, intense fierce golden eyes, small pink tiger nose, sleek powerful tiger appearance, fierce confident expression, clean smooth fur with no exposed skin anywhere, pure tiger face on human body below`,
    `photorealistic, realistic tiger, scary, aggressive, photorealistic fur, realistic animal head, human face, exposed skin, cute mascot style, too many stripes, faded colors, pastel colors, soft colors`],
  ['🐶',
    `a photo of a dog-shaped person img, 3d CGI, art by Pixar, with a snout, floppy dog ears, fully furred head with warm brown and tan fur covering the entire face, forehead, cheeks, nose and chin, dog snout and dog nose, dog fur texture throughout, clean thick fur with no exposed human skin on face, natural dog fur with no shine, pure dog face on human body below, alert dog expression`,
    `photorealistic, realistic dog, scary, aggressive, photorealistic fur, realistic animal head, human face, exposed skin, human features, standing ears, pointed ears, small ears, photorealistic dog head`],
  ['🦈',
    `a person transformed into a shark-shaped head img, 3d CGI, art by Pixar, blue-grey shark skin, a dorsal fin on the head, and a wide toothy grin with small sharp teeth. Underwater blue light, fun, bubbles and friendly.`,
    `friendly dolphin, cute, happy, land animal, no teeth, no fin, colorful, sunshine`],
  ['🐱',
    `a person transformed into a Siamese cat-shaped head img, 3D CGI, art by Pixar, realistic fur texture, cat ears, striking blue eyes, delicate whiskers, elegant and regal expression`,
    `cartoon, anime, flat, ugly, dull, human ears, no fur, no whiskers, plain, ordinary eyes, chaotic`],
  ['🦁',
    `a person transformed into a lion-shaped head img, 3D CGI, art by Pixar, realistic fur and mane, strong jawline, golden eyes, majestic and powerful expression`,
    `cartoon, anime, flat, no fur, small eyes, weak expression, plain, dull, chaotic`],
  ['🐘',
    `a person transformed into an elephant-shaped head img, 3D CGI, art by Pixar, realistic skin texture, large ears, trunk, tusks, wise and calm expression`,
    `cartoon, anime, flat, no trunk, small ears, weak expression, plain, dull, chaotic`],
  ['🐧',
    `a person transformed into a penguin-shaped head img, 3D CGI, art by Pixar, realistic feather texture, black and white coloring, orange beak, playful yet dignified expression`,
    `cartoon, anime, flat, no beak, no feathers, human nose, plain, dull, chaotic`],
  ['🐻',
    `a person transformed into an arctic bear-shaped head img, 3D CGI, art by Pixar, realistic fur texture, black nose, powerful features, warm yet wild expression`,
    `cartoon, anime, flat, no fur, no bear features, small eyes, plain, dull, chaotic`],
  ['🐰',
    `a person transformed into a white rabbit-shaped head img, 3D CGI, art by Pixar, realistic fur texture, long ears, whiskers, expressive eyes, soft and lively expression`,
    `cartoon, anime, flat, no fur, short ears, human nose, plain, dull, chaotic`],
  ['🪱',
    `a person transformed into a cobra-shaped head img, 3D CGI, art by Pixar, realistic scales, reptilian eyes, subtle cobra features, intense and captivating expression`,
    `cartoon, anime, flat, no scales, normal human skin, round eyes, plain, dull, chaotic`],
  ['🐷',
    `a person transformed into a pig-shaped head img, 3D CGI, art by Pixar, realistic pink skin and fur texture, pig snout, large ears, friendly and playful expression`,
    `cartoon, anime, flat, no snout, no fur, human nose, small ears, plain, dull, chaotic`],
  ['🐮',
    `a person transformed into a cow-shaped head with angelic golden halo img, 3D CGI, art by Pixar, realistic fur texture, horns, cow ears, black and white patches, glowing golden halo above the head, expressive and wholesome expression`,
    `cartoon, anime, flat, no horns, no cow features, no halo, plain, dull, chaotic`],
  ['🐼',
    `a person transformed into a fat panda-shaped head img, 3D CGI, art by Pixar, realistic fur texture, black and white coloring, round ears, distinctive black eye patches, gentle and friendly expression`,
    `cartoon, anime, flat, no fur, human features, small ears, plain, dull, chaotic`],

  // ===== WEATHER AND OBJECTS =====
  ['🌞',
    `a portrait of a face of a very happy sun with human features img, 3D CGI, art by Pixar, warm golden light, smiling face, radiant`,
    `sad, angry, dark, no face, cloudy, dull, chaotic, playground`],
  ['☁️',
    `a portrait of a cloudy cloud with human features img, 3D CGI, art by Pixar, expressive face, soft cloudy texture, moody lighting`,
    `happy, clear sky, no face, bright, dull, chaotic, playground`],

  // ===== PEOPLE AND FRANCHISE CHARACTERS =====
  ['🎄',
    `a person transformed into a Grinch-shaped head img, 3D CGI, art by Pixar, realistic lime-green fur texture, mischievous yellow-green eyes, wrinkled expressive face, sly smirk, thick green eyebrows, tufts of green fur framing the cheeks`,
    `cartoon, anime, flat, smooth skin, no fur, human skin color, friendly innocent expression, blue fur, dull, chaotic, playground`],
  ['🎅',
    `a person transformed into a Santa Claus-shaped head img, 3D CGI, art by Pixar, realistic rosy skin, thick fluffy white beard and mustache, bushy white eyebrows, warm sparkling eyes, classic red velvet hat with white fur trim, jolly smile`,
    `cartoon, anime, flat, no beard, no mustache, black beard, young face, angry, dull, chaotic, playground`],
  ['♥️',
    `a person transformed into a Queen of Hearts-shaped head img, 3D CGI, art by Pixar, pale realistic skin, elaborate red and black royal crown shaped like hearts, dramatic arched eyebrows, crimson lipstick, regal hairstyle, heart-shaped facial accents, commanding and imperious expression`,
    `cartoon, anime, flat, no crown, no hearts, ordinary hairstyle, friendly casual expression, dull, chaotic, playground`],
  ['🧘',
    `a person transformed into a Yoda-shaped head img, 3D CGI, art by Pixar, realistic green wrinkled skin, large pointed ears, wise expressive eyes, deeply detailed forehead wrinkles, sparse white hair, small rounded nose, sage-like expression`,
    `cartoon, anime, flat, human ears, smooth skin, no wrinkles, young face, blue skin, angry expression, dull, chaotic, playground`],
  ['🏺',
    `a person transformed into a Cleopatra-shaped head img, 3D CGI, art by Pixar, elegant ancient Egyptian royal beauty, straight jet-black hair, iconic gold and blue striped headdress, dramatic kohl eyeliner, golden eyeshadow, ornate Egyptian gold jewelry, regal confident expression`,
    `cartoon, anime, flat, blonde hair, no headdress, no jewelry, modern clothing, minimal makeup, casual expression, dull, chaotic, playground`],
  ['🍄',
    `a person transformed into a Super Mario-shaped head img, 3D CGI, art by Pixar, iconic red cap with white M emblem, thick black mustache, bright blue eyes, rounded nose, cheerful adventurous expression, realistic skin texture, highly detailed`,
    `cartoon, anime, flat, no red cap, no mustache, green cap, angry, dull, chaotic, playground`],
  ['🍀',
    `a person transformed into a Luigi-shaped head img, 3D CGI, art by Pixar, iconic green cap with white L emblem, thick dark mustache, bright blue eyes, rounded nose, friendly slightly nervous expression, realistic skin texture, highly detailed`,
    `cartoon, anime, flat, red cap, no mustache, no green cap, aggressive expression, dull, chaotic, playground`],
  ['🍑',
    `a person transformed into a Princess Peach-shaped head img, 3D CGI, art by Pixar, long golden blonde hair, sparkling blue eyes, elegant gold crown with colorful gemstones, blue spherical earrings, rosy cheeks, graceful royal expression, highly detailed`,
    `cartoon, anime, flat, short black hair, no crown, no earrings, masculine features, dull, chaotic, playground`],
  ['🐢',
    `a person transformed into a Bowser-shaped head img, 3D CGI, art by Pixar, massive green reptilian head, orange-red spiky hair, curved ivory horns, sharp teeth, yellow-orange eyes, rugged scaly skin, fierce villainous expression, highly detailed`,
    `cartoon, anime, flat, smooth human skin, no horns, no spikes, no scales, gentle expression, dull, chaotic, playground`],
  ['🥚',
    `a person transformed into a Yoshi-shaped head img, 3D CGI, art by Pixar, vibrant green reptilian skin, large expressive eyes, rounded snout, wide friendly smile, small orange dorsal spikes, soft white cheeks, playful adventurous expression, highly detailed`,
    `cartoon, anime, flat, no green skin, no snout, no spikes, sharp predatory teeth, dull, chaotic, playground`],
  ['🥋',
    `a person transformed into a Chun-Li-shaped head from Street Fighter img, 3D CGI, art by Pixar, iconic dark brown hair in two symmetrical buns with white ribbons, strong expressive brown eyes, athletic facial features, blue qipao-inspired collar, spiked white wristband detail near the frame edge, determined confident expression, highly detailed`,
    `cartoon, anime, flat, blonde hair, no hair buns, no ribbons, weak expression, dull, chaotic, playground`],
  ['🎖️',
    `a person transformed into a Guile-shaped head from Street Fighter img, 3D CGI, art by Pixar, iconic tall flat-top blonde military haircut, strong square jaw, stern blue eyes, rugged facial features, military-green collar, confident disciplined expression, highly detailed`,
    `cartoon, anime, flat, long hair, dark hair, no flat-top, soft weak jaw, smiling, dull, chaotic, playground`],
  ['⚔️',
    `a person transformed into a She-Ra-shaped head img, 3D CGI, art by Pixar, long flowing golden blonde hair, iconic gold winged tiara with red gemstone, bright blue eyes, strong graceful facial features, white and gold warrior collar, heroic confident expression, highly detailed`,
    `cartoon, anime, flat, dark hair, no tiara, no gold accents, villainous expression, dull, chaotic, playground`],
  ['🌈',
    `a person transformed into a Rainbow Brite-shaped head img, 3D CGI, art by Pixar, short blonde bob hairstyle, colorful rainbow headband, bright blue eyes, rosy cheeks, cheerful smile, vivid rainbow-colored collar, vibrant magical lighting, highly detailed`,
    `cartoon, anime, flat, dark gloomy colors, no rainbow, no blonde hair, sad expression, dull, chaotic, playground`],
  ['🎤',
    `a person transformed into a Jem-shaped head img, 3D CGI, art by Pixar, voluminous hot pink hair, dramatic purple and pink eye makeup, sparkling star-shaped earrings, glamorous rock-star expression, metallic pink collar, holographic highlights, highly detailed`,
    `cartoon, anime, flat, brown hair, no pink hair, no makeup, plain appearance, dull, chaotic, playground`],
  ['💙',
    `a person transformed into a Smurfette-shaped head img, 3D CGI, art by Pixar, bright blue skin, long flowing golden blonde hair, large expressive blue eyes, delicate eyelashes, white Smurf hat, sweet friendly smile, highly detailed`,
    `cartoon, anime, flat, human skin color, dark hair, no white hat, no blue skin, angry expression, dull, chaotic, playground`],
  ['🧢',
    `a person transformed into a Smurf-shaped head img, 3D CGI, art by Pixar, bright blue skin, oversized white Smurf hat, rounded nose, large expressive eyes, cheerful mischievous smile, white collar, soft detailed skin texture, highly detailed`,
    `cartoon, anime, flat, human skin color, no blue skin, no white hat, long dark hair, serious expression, dull, chaotic, playground`],
  ['🦍',
    `a person transformed into a Donkey Kong-shaped head img, 3D CGI, art by Pixar, thick brown fur, prominent brow, broad muzzle, expressive deep-set eyes, powerful jaw, large nostrils, iconic red necktie with yellow DK lettering visible at the bottom, confident playful expression, highly detailed`,
    `cartoon, anime, flat, no fur, smooth human skin, no muzzle, no broad jaw, weak expression, dull, chaotic, playground`],
  ['🐆',
    `a person transformed into a Thundercats Cheetara-shaped head img, 3D CGI, art by Pixar, golden tawny feline skin, subtle cheetah spots across cheeks and temples, long blonde hair, pointed feline ears, bright amber eyes, athletic graceful expression, orange-gold warrior collar, highly detailed`,
    `cartoon, anime, flat, no spots, no feline ears, dark hair, smooth human skin, dull, chaotic, playground, human ears`],
  ['🗡️',
    `a person transformed into Thundercats' Lion-O-shaped head img, 3D CGI, art by Pixar, vivid orange-red feline hair, prominent feline ears, golden fur accents, intense blue eyes, strong feline nose, heroic determined expression, blue and gold armor collar, highly detailed`,
    `cartoon, anime, flat, no feline ears, no orange hair, no feline features, weak expression, dull, chaotic, playground, human ears`],
  ['🐕',
    `a person transformed into a Scooby-Doo-shaped head img, 3D CGI, art by Pixar, lovable Great Dane dog features, warm brown fur, distinctive black spots along the muzzle, large floppy ears, oversized expressive brown eyes, broad black nose, goofy friendly grin, blue collar with a diamond-shaped SD tag, highly detailed`,
    `cartoon, anime, flat, cat features, pointed ears, no brown fur, no black nose, no floppy ears, aggressive snarling, dull, chaotic, playground`],
  ['🚀',
    `a person transformed into Voltron's Princess Allura-shaped head img, 3D CGI, art by Pixar, long flowing pale blue hair, elegant pointed elf-like ears, bright blue eyes, delicate royal tiara, white and pale blue royal collar, graceful confident expression, highly detailed`,
    `cartoon, anime, flat, dark hair, no tiara, no pointed ears, rugged masculine features, dull, chaotic, playground`],
  ['🦹',
    `a person transformed into Voltron's Lotor-shaped head img, 3D CGI, art by Pixar, long silver-white hair with subtle lavender undertones, pointed ears, sharp aristocratic facial features, intense purple eyes, dark purple and black royal armor collar, calculating villainous expression, highly detailed`,
    `cartoon, anime, flat, short brown hair, no pointed ears, no silver hair, cheerful innocent expression, dull, chaotic, playground`],
  ['👊',
    `a person transformed into Dragonball Z's Goku-shaped head img, 3D CGI, art by Pixar, iconic sharply spiked black hair, strong expressive eyes, determined cheerful expression, orange martial arts gi collar with dark blue undershirt, defined eyebrows, subtle energy glow, highly detailed`,
    `cartoon, anime, flat, blonde hair, smooth flat hairstyle, no spiky hair, evil expression, dull, chaotic, playground`],
  ['💪',
    `a person transformed into Dragonball Z's Vegeta-shaped head img, 3D CGI, art by Pixar, iconic sharply upswept black widow's peak hairstyle, intense narrow eyes, pronounced eyebrows, proud scowling expression, blue Saiyan armor collar with white and gold accents, highly detailed`,
    `cartoon, anime, flat, long flowing hair, no widow's peak, round soft eyebrows, smiling expression, dull, chaotic, playground`],
  ['👾',
    `a person transformed into Dragonball Z's Frieza-shaped head img, 3D CGI, art by Pixar, smooth white alien skin with glossy purple bio-armor patches on the forehead and cheeks, sleek elongated skull, narrow red eyes, small nose, sinister confident smirk, organic alien facial contours, highly detailed`,
    `cartoon, anime, flat, ordinary human skin, no purple patches, no alien features, furry face, friendly expression, dull, chaotic, playground`],
  ['🌙',
    `a person transformed into a Sailor Moon-shaped head img, 3D CGI, art by Pixar, iconic blonde twin buns with long flowing pigtails, blue eyes, red and gold tiara with central gemstone, crescent moon forehead symbol, white and navy sailor collar with red bow visible at the bottom, cheerful magical expression, highly detailed`,
    `cartoon, anime, flat, short dark hair, no twin buns, no crescent moon, no tiara, dull, chaotic, playground`],
  ['🌸',
    `a person transformed into a Sailor Chibi Moon-shaped head img, 3D CGI, art by Pixar, pastel pink hair styled into twin buns and short pigtails, bright red-pink eyes, tiny gold crescent moon tiara, playful youthful expression, white and pink sailor collar with red bow, highly detailed`,
    `cartoon, anime, flat, blonde hair, no pink hair, no twin buns, no tiara, mature stern expression, dull, chaotic, playground`],
  ['⭐',
    `a person transformed into a Sailor Galaxia-shaped head img, 3D CGI, art by Pixar, long voluminous golden blonde hair, sharp amber eyes, ornate gold celestial crown, metallic gold shoulder armor framing the head, cosmic gold jewelry, powerful commanding expression, glowing starlight accents, highly detailed`,
    `cartoon, anime, flat, black hair, no gold accents, no crown, plain casual appearance, dull, chaotic, playground`],
  ['🔥',
    `a person transformed into a Princess Kakyuu-shaped head img, 3D CGI, art by Pixar, long flowing vivid red hair, delicate golden forehead ornament, elegant almond-shaped eyes, ornate white and red royal collar, refined celestial beauty, calm regal expression, subtle sparkling cosmic accents, highly detailed`,
    `cartoon, anime, flat, blonde hair, no red hair, no forehead ornament, ordinary casual clothing, dull, chaotic, playground`],
  ['🪞',
    `a person transformed into a Queen Nehellenia-shaped head img, 3D CGI, art by Pixar, extremely long flowing silver-white hair, pale luminous skin, piercing violet eyes, elaborate dark royal crown with crescent moon details, dramatic dark eye makeup, black and silver gothic collar, mysterious sinister expression, highly detailed`,
    `cartoon, anime, flat, short dark hair, no silver hair, no crown, cheerful innocent expression, dull, chaotic, playground`],
  ['🕰️',
    `a person transformed into a Sailor Pluto-shaped head img, 3D CGI, art by Pixar, long dark forest-green hair, deep ruby-red eyes, gold forehead tiara with a red gemstone, elegant dark green sailor collar, mysterious mature expression, subtle garnet jewel accents, cosmic time-warp shimmer, highly detailed`,
    `cartoon, anime, flat, blonde hair, no red eyes, no tiara, bright pink costume, childish expression, dull, chaotic, playground`],
  ['🔱',
    `a person transformed into a Sailor Neptune-shaped head img, 3D CGI, art by Pixar, long flowing deep teal-green hair, elegant turquoise eyes, delicate gold tiara with a blue gemstone, refined facial features, dark teal sailor collar with a large blue bow, graceful serene expression, subtle oceanic shimmer, highly detailed`,
    `cartoon, anime, flat, short blonde hair, no teal hair, no tiara, orange costume, aggressive expression, dull, chaotic, playground`],
  ['⚡',
    `a person transformed into a Sailor Jupiter-shaped head img, 3D CGI, art by Pixar, chestnut-brown hair styled in a high ponytail, bright green eyes, gold tiara with a green gemstone, small rose-shaped earrings, green sailor collar with pink bow accents, athletic confident expression, subtle electric green lightning effects, highly detailed`,
    `cartoon, anime, flat, short blonde hair, no ponytail, blue eyes, no green accents, timid expression, dull, chaotic, playground`],
  ['🪐',
    `a person transformed into a Sailor Saturn-shaped head img, 3D CGI, art by Pixar, short dark purple hair with soft bangs, large deep violet eyes, delicate purple gemstone tiara, dark purple sailor collar with burgundy accents, mysterious quiet expression, subtle violet cosmic energy, highly detailed`,
    `cartoon, anime, flat, long blonde hair, no purple hair, no tiara, bright orange costume, cheerful exaggerated expression, dull, chaotic, playground`],
  ['🧣',
    `a person transformed into Scooby Doo's Daphne-shaped head img, 3D CGI, art by Pixar, long vibrant red-orange hair, purple headband, bright green eyes, elegant purple scarf around the neck, stylish lavender collar, confident glamorous smile, classic mystery-solving fashion, highly detailed`,
    `cartoon, anime, flat, blonde hair, no purple headband, no scarf, black glasses, green hair, dull, chaotic, playground`],
  ['🔍',
    `a person transformed into Scooby Doo's Velma-shaped head img, 3D CGI, art by Pixar, short chestnut-brown bob haircut, thick black square glasses, intelligent brown eyes, freckles, orange turtleneck collar, focused analytical expression, warm retro mystery aesthetic, highly detailed`,
    `cartoon, anime, flat, blonde hair, no glasses, long hair, blue clothing, confused vacant expression, dull, chaotic, playground`],
  ['🦴',
    `a person transformed into a Wilma Flintstone img, 3D CGI, art by Pixar, warm peach skin, large expressive eyes, short vibrant orange-red hair styled in a classic rounded updo, thick eyelashes, arched eyebrows, small nose, signature pearl necklace, confident elegant smile, prehistoric stone-age fashion aesthetic, smooth rounded facial features, highly detailed textures, cinematic studio lighting, glossy finish, centered head portrait, isolated background`,
    `cartoon, anime, flat, 2D, low quality, blurry, long hair, wrong hair color, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🍼',
    `a person transformed into heads-only Pebbles Flintstone img, 3D CGI, art by Pixar, soft peach skin, chubby toddler cheeks, enormous bright expressive eyes, tiny rounded nose, adorable happy smile, vibrant orange-red hair gathered into a high topknot tied with a small turquoise bone accessory, a few playful bangs, cute prehistoric toddler aesthetic, soft rounded facial features`,
    `cartoon, anime, flat, 2D, low quality, blurry, adult face, long flowing hair, wrong hair color, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🪡',
    `a person transformed into a Sally from The Nightmare Before Christmas-shaped head img, 3D CGI, art by Pixar, pale blue stitched ragdoll skin, large expressive yellow-green eyes, thin arched eyebrows, small delicate nose, subtle stitched smile, long vibrant red hair with loose strands framing the face, visible patchwork seams across the cheeks and forehead, charmingly melancholic expression, gothic Halloween aesthetic, highly detailed fabric-like skin texture, cinematic studio lighting, glossy finish, centered head portrait, isolated background`,
    `cartoon, anime, flat, 2D, low quality, blurry, realistic human skin, missing stitches, blonde hair, short hair, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🪲',
    `a person transformed into a Beetlejuice-shaped head img, 3D CGI, art by Pixar, pale ghostly greenish-white skin, wild frizzy green hair with dark roots, large expressive yellow-green eyes with dark under-eye circles, heavy dark eyebrows, crooked mischievous grin, cracked lips, dark purple eye bags, black grime and subtle decay marks across the face, iconic black-and-white striped collar visible at the base, chaotic eccentric expression, spooky gothic comedy aesthetic`,
    `cartoon, anime, flat, 2D, low quality, blurry, clean flawless skin, normal hairstyle, bright healthy complexion, friendly innocent expression, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🎶',
    `a portrait of K-Pop's Rumi Kang img, 3D CGI, art by Pixar, long purple braided hair with layered bangs, expressive violet eyes, subtle magenta highlights, stylish K-pop idol makeup, futuristic purple stage outfit collar, confident fierce expression, subtle supernatural purple energy, highly detailed`,
    `cartoon, anime, flat, short blonde hair, no bangs, no purple accents, plain clothing, dull expression, chaotic, playground`],
  ['🎧',
    `a person transformed into KPop's Zoey img, 3D CGI, art by Pixar, warm fair skin, large expressive dark brown eyes, short dark purple-black hair styled in a high messy bun with blunt bangs and loose face-framing strands, playful confident smirk, delicate nose, sharp eyeliner, youthful rounded facial features, futuristic K-pop demon hunter aesthetic, turquoise-green cropped top details, edgy gold accessories, subtle purple highlights in her hair, energetic mischievous personality, preserve recognizable human facial features while blending seamlessly into Zoey's stylized appearance, highly detailed skin and hair textures, cinematic neon stage lighting, glossy finish, centered head portrait, isolated background`,
    `cartoon, anime, flat, 2D, low quality, blurry, long blonde hair, pink hair, wrong hairstyle, oversized head accessories, pale lifeless eyes, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🎀',
    `a person transformed into KPop's Mira img, 3D CGI, art by Pixar, long vivid pink hair, dramatic layered bangs, sharp expressive eyes, glamorous K-pop idol makeup, stylish pink and black stage outfit collar, confident rebellious expression, subtle neon pink highlights, highly detailed`,
    `cartoon, anime, flat, short brown hair, no pink hair, plain makeup, dull expression, ordinary clothing, chaotic, playground`],
  ['🎸',
    `a person transformed into KPop's Abby Saja img, 3D CGI, art by Pixar, handsome male K-pop demon idol, dark swept-back hair, intense eyes, sharp jawline, subtle supernatural markings, stylish dark stage outfit collar, charismatic mysterious smirk, faint violet demonic aura, highly detailed`,
    `cartoon, anime, flat, bright pink hair, feminine hairstyle, no supernatural markings, friendly innocent expression, plain clothing, chaotic, playground`],
  ['🧪',
    `a person transformed into Dexter's Laboratory's Dexter-shaped head img, 3D CGI, art by Pixar, oversized rounded head, bright orange hair, large round black-rimmed glasses, expressive blue eyes, small nose, serious intelligent expression, white lab coat collar, futuristic laboratory lighting, highly detailed`,
    `cartoon, anime, flat, no glasses, no orange hair, dark sunglasses, muscular adult face, casual clothing, dull, chaotic, playground`],
  ['🏛️',
    `a person transformed into Megara from Hercules img, 3D CGI, art by Pixar, warm olive skin, large expressive violet eyes, elegant arched eyebrows, defined cheekbones, small straight nose, confident sarcastic smirk, voluminous deep auburn hair styled in a high cascading ponytail with soft curved bangs, graceful Greek-inspired beauty, sophisticated and independent expression, highly detailed hair and skin textures, cinematic studio lighting, glossy finish, centered head portrait, isolated background`,
    `cartoon, anime, flat, 2D, low quality, blurry, blue eyes, blonde hair, short hair, childish face, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🪔',
    `a person transformed into Princess Jasmine from Aladdin img, 3D CGI, art by Pixar, warm caramel skin, enormous almond-shaped brown eyes, thick defined eyebrows, long glossy black hair styled in a voluminous high ponytail with turquoise hairbands, delicate nose, full lips, confident regal smile, turquoise jeweled headband with a blue gemstone, exotic Arabian royal aesthetic, expressive and adventurous personality, highly detailed skin and hair textures`,
    `cartoon, anime, flat, 2D, low quality, blurry, blonde hair, blue eyes, pale skin, short hair, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🌹',
    `a person transformed into Belle from Beauty and the Beast img, 3D CGI, art by Pixar, fair warm skin, large expressive hazel-brown eyes, delicate arched eyebrows, soft rosy lips, gentle rounded nose, rich chestnut-brown hair styled in a half-updo with flowing curls, a few loose strands framing the face, intelligent and kind expression, elegant golden ballgown neckline subtly visible, classic fairytale princess aesthetic, highly detailed hair and skin textures`,
    `cartoon, anime, flat, 2D, low quality, blurry, blonde hair, black hair, short hair, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🍎',
    `a person transformed into a Snow White img, 3D CGI, art by Pixar, porcelain-fair skin, large innocent brown eyes, delicate arched eyebrows, rosy cheeks, ruby-red lips, short glossy black bob with curled ends, distinctive center-parted hair and a small red bow headband, sweet gentle smile, classic fairytale princess aesthetic, soft youthful facial features, highly detailed hair and skin textures`,
    `cartoon, anime, flat, 2D, low quality, blurry, blonde hair, long flowing hair, dark skin, missing red bow, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
  ['🏰',
    `a person transformed into Aurora from Sleeping Beauty img, 3D CGI, art by Pixar, fair luminous skin, large expressive violet-blue eyes, delicate arched eyebrows, soft rosy lips, long flowing golden-blonde hair with elegant sweeping bangs, graceful oval face, subtle pink blush, serene dreamy smile, delicate golden tiara, romantic fairytale princess aesthetic, elegant and ethereal expression, highly detailed hair and skin textures`,
    `cartoon, anime, flat, 2D, low quality, blurry, black hair, red hair, short hair, brown eyes, distorted face, asymmetrical eyes, extra eyes, extra mouths, deformed features, dull colors, chaotic background, full body, cropped head`],
];

const EMOJI_MAP = {};
EMOJI_PROMPTS.forEach(([ch, prompt, negative]) => {
  EMOJI_MAP[normEmoji(ch)] = { prompt, negative };
});

function lookup(emoji) {
  return EMOJI_MAP[normEmoji(emoji)] || null;
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

// ---- Artify: one plan per painter ----
const KONTEXT_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions';
// Optional env FACE_TO_MANY_VERSION overrides this default version hash.
const FACE_TO_MANY_DEFAULT_VERSION = 'a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8deaf';
const ART_NEG = 'photo, photograph, realistic skin texture, blurry, low quality, pixelated, compression artifacts, noise, extra fingers, watermark, text';
const ART_NEG_F2M = 'blurry, low quality, compression artifacts, noise';
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
  vermeer: { model: 'instantid', prompt: 'a Dutch Golden Age portrait of a person in the style of Johannes Vermeer, soft window light, dark neutral background' },
  sargent: { model: 'instantid', prompt: 'a society portrait of a person in the style of John Singer Sargent, confident bold brushwork, dark elegant background, crisp highlights, refined composure' },
  lichtenstein: { model: 'kontext', prompt: 'a Roy Lichtenstein style comic book pop art panel with thick black outlines of a person, Ben-Day dots and flat primary colors.' },
  degas: { model: 'instantid', prompt: 'a pastel portrait of a person in the style of Edgar Degas, soft chalky pastel strokes, loose sketched lines, off-centre composition, theatrical light' },
  murakami: { model: 'instantid', prompt: 'a superflat pop portrait of a person in the style of Takashi Murakami, glossy bright colors, smiling rainbow flowers, anime-inspired cheer' },
  modigliani: { model: 'instantid', prompt: 'a modernist portrait of a person in the style of Amedeo Modigliani, elongated neck and face, almond-shaped eyes, simplified smooth forms, warm ochre and cream tones' },
  raphael: { model: 'instantid', prompt: 'a High Renaissance portrait of a person in the style of Raphael, harmonious balanced composition, soft graceful modelling, serene idealized features, warm golden landscape' },
  gauguin: { model: 'instantid', prompt: 'a post-Impressionist painting of a person in the style of Paul Gauguin, flat areas of bold colour, thick dark outlines, warm tropical palette, saturated colour blocks, decorative Synthetist simplicity' },
};

// Painters that run on bytedance/pulid instead of Instant-ID.
// Optional env PULID_VERSION pins a version hash; without it the model-name endpoint is used.
const PULID_URL = 'https://api.replicate.com/v1/models/bytedance/pulid/predictions';
const PULID_ARTISTS = new Set([
  'rembrandt', 'gaudi', 'picasso', 'lempicka', 'munch', 'klimt', 'davinci',
  'renoir', 'boldini', 'vermeer', 'sargent', 'modigliani', 'raphael', 'degas',
  'kahlo',
]);

// ---- I Could Be...: one PuLID prompt per character (owner's list) ----
const CB_TAIL = 'blurry, low resolution, full body, text, watermark';
const COULD_BE = {};
function cb(id, prompt, negative) {
  COULD_BE[id] = { prompt, negative: `${negative}, ${CB_TAIL}` };
}

cb('barbie',
  `photorealistic head-only portrait inspired by live-action Barbie, preserve the subject's recognizable facial identity and natural facial proportions, glamorous blonde hair with voluminous soft waves, polished pink headband, bright sparkling blue eyes, radiant confident smile, sophisticated rosy pink makeup, glossy pink outfit neckline visible at the bottom of the frame, realistic skin pores and natural skin texture, luminous beauty lighting, pastel pink studio background, luxurious fashion editorial photography, 85mm portrait lens, shallow depth of field, realistic live-action movie aesthetic, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, plastic skin, porcelain texture, artificial facial features, altered identity, exaggerated eyes, over-smoothed skin, excessive blush, distorted smile, unnatural teeth, messy hair`);
cb('leia',
  `photorealistic head-only portrait of Princess Leia from Star Wars, preserve the subject's recognizable facial identity and natural facial proportions, iconic symmetrical cinnamon-brown hair buns positioned on both sides of the head, elegant white high-collar robe visible at the bottom of the frame, determined yet graceful expression, natural skin pores and fine facial details, subtle 1970s-inspired beauty styling, soft cinematic lighting, muted galactic sci-fi background, authentic live-action space opera aesthetic, professional cinematic portrait photography, sharp focus, ultra-detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, missing hair buns, asymmetrical buns, futuristic helmet, excessive sci-fi armor, distorted facial features, deformed eyes, exaggerated makeup`);
cb('maleficent',
  `photorealistic head-only portrait of Maleficent, preserve the subject's recognizable facial identity and natural facial proportions, iconic tall black curved horns framing the head, dramatic sculpted cheekbones, elegant arched eyebrows, intense piercing eyes, deep crimson lipstick, pale realistic skin with visible pores, flowing black robe collar visible at the bottom of the frame, subtle dark smoky eye makeup, ominous regal expression, dramatic chiaroscuro lighting, dark enchanted forest background, luxurious black textures, live-action dark fantasy film aesthetic, professional cinematic portrait photography, sharp focus, ultra-detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, exaggerated horns, horns covering the face, distorted facial features, deformed eyes, excessive wrinkles, messy makeup, grotesque monster`);
cb('snow_queen',
  `Photorealistic head-only portrait of the Snow Queen, preserve the subject's recognizable facial identity, ethereal icy beauty, long platinum-white hair with delicate frozen strands, piercing ice-blue eyes, porcelain-pale skin, elegant angular cheekbones, regal cold expression, intricate crystalline ice crown, shimmering silver and pale-blue details around the neckline, delicate frost patterns along the temples, magical winter atmosphere, cool blue cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, warm orange lighting, dark brown hair, bright red hair, green eyes, melting ice, oversized crown, excessive glitter, cheerful expression`);
cb('grinch',
  `photorealistic head-only portrait of the Grinch reimagined as a realistic live-action creature, preserve the subject's recognizable facial identity and underlying facial proportions, dense short lime-green fur covering the face, subtle darker green fur around the forehead and cheeks, expressive yellow-green eyes with a mischievous narrowed gaze, characteristic sly smirk, realistic fur strands following facial contours, textured green prosthetic nose integrated naturally into the face, subtle wrinkles around the eyes and mouth, hint of a red Santa collar at the bottom of the frame, dramatic winter lighting, softly blurred snowy Whoville background, practical creature makeup and prosthetics, photorealistic holiday fantasy film aesthetic, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, doll face, artificial features, altered identity, missing pigtails, entirely pink hair, entirely blue hair, excessive face tattoos, exaggerated clown makeup, distorted facial features, deformed eyes`);
cb('wonder_woman',
  `photorealistic head-only portrait of Wonder Woman, preserve the subject's recognizable facial identity and natural facial proportions, long flowing dark brown hair, iconic polished gold tiara with a centered red star, subtle red and gold armored neckline visible at the bottom of the frame, confident powerful gaze, natural skin pores and realistic facial texture, elegant warrior beauty, warm bronze highlights, dramatic cinematic lighting, rich deep red and gold tones, live-action superhero movie aesthetic, 85mm portrait photography, sharp focus, ultra-detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, distorted facial features, deformed eyes, oversized tiara, excessive armor obscuring the face, exaggerated makeup`);
cb('indiana_jones',
  `photorealistic head-only portrait of Indiana Jones, preserve the subject's recognizable facial identity and natural facial proportions, iconic weathered brown fedora, rugged dark brown hair, subtle stubble, adventurous focused expression, worn brown leather jacket collar visible at the bottom of the frame, realistic skin pores and individual hair strands`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, distorted facial features, oversized hat hiding the eyes, modern baseball cap, futuristic clothing, exaggerated facial hair`);
cb('jack_sparrow',
  `photorealistic head-only portrait of Captain Jack Sparrow from Pirates of the Caribbean, preserve the subject's recognizable facial identity and natural facial proportions, dark brown dreadlocked hair with weathered beads and braided strands, faded burgundy bandana wrapped around the head, subtle kohl-lined eyes, thin mustache and braided goatee with small decorative beads, weathered tricorn pirate hat, layered leather and fabric pirate collar visible at the bottom of the frame, mischievous drunken smirk, realistic sun-weathered skin pores, warm tropical sunlight, softly blurred Caribbean sailing ship background, authentic live-action pirate adventure film aesthetic, cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, clean modern hairstyle, missing bandana, oversized hat hiding the eyes, exaggerated facial hair, excessive beads covering the face, distorted facial features`);
cb('yoda',
  `Photorealistic head-only portrait of Yoda, preserve the subject's facial identity within creature anatomy, deeply wrinkled green skin, large iconic pointed ears, wise and intense eyes, sparse tufts of white hair on head, soft earthy lighting, swamp-like atmosphere, cinematic creature photography, sharp focus, ultra-detailed textures.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, human ears, smooth skin, tall stature, hairless`);
cb('geralt',
  `Photorealistic head-only portrait of Geralt of Rivia, preserve the subject's recognizable facial identity, long white hair, vertical facial scars, piercing yellow witcher eyes, rugged weathered skin, intense grizzled expression, dramatic rugged lighting, dark fantasy film aesthetic, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, clean skin, young face, warm lighting`);
cb('professor_x',
  `Photorealistic head-only portrait of Charles Xavier, preserve the subject's recognizable facial identity, completely bald head, intelligent and empathetic eyes, sophisticated scholarly expression, sharp features, wearing a modern suit, clean professional cinematic lighting, sci-fi drama aesthetic, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, full hair, aggressive, messy`);
cb('hulk',
  `Photorealistic head-only portrait of The Hulk, preserve the subject's facial identity within creature anatomy, intense muscular facial structure, vibrant green skin, manic and ferocious expression, heavy brow line, cinematic dramatic lighting, action film aesthetic, sharp focus, ultra-detailed skin pores and texture.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, small stature, calm expression, smooth skin, human skin color`);
cb('t800',
  `Photorealistic head-only portrait of T800, preserve the subject's recognizable facial identity, partially exposed metallic endoskeleton on half of the face, glowing red mechanical eye, stoic and emotionless expression, cinematic high-contrast lighting, sci-fi action film aesthetic, sharp focus, ultra-detailed metal textures.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, fully human, smiling, warm expression`);
cb('neo',
  `Photorealistic head-only portrait of The Matrix' Neo, preserve the subject's recognizable facial identity, signature black sunglasses, slicked dark hair, stoic focused expression, subtle cinematic color grading, high-contrast lighting, sci-fi action film aesthetic, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, no glasses, smiling, long hair`);
cb('groot',
  `Photorealistic head-only portrait of Groot, preserve the subject's facial identity within wood-creature anatomy, bark-like skin texture, mossy patches, large gentle expressive eyes, warm ambient lighting, cinematic sci-fi fantasy aesthetic, sharp focus, ultra-detailed wooden texture.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, human skin, hair, aggressive`);
cb('shrek',
  `Photorealistic head-only portrait of Shrek, preserve the subject's facial identity within ogre anatomy, vibrant green skin, iconic trumpet-shaped ears, stern yet goofy expression, cinematic lighting, dark fantasy comedy aesthetic, sharp focus, ultra-detailed ogre skin pores.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, human, small ears`);
cb('dia_de_muertos',
  `photorealistic head-only portrait inspired by Día de los Muertos, preserve the subject's recognizable facial identity and facial proportions, elaborate hand-painted sugar skull makeup applied directly to realistic human skin, intricate symmetrical white skull patterns around the eyes and cheeks, black decorative eye sockets that retain visible expressive eyes, delicate floral motifs in vivid red, orange and turquoise, ornate marigold flowers woven into styled hair, subtle ornamental filigree across the forehead, authentic Mexican cultural celebration aesthetic, realistic makeup texture and fine brushwork, warm candlelight, rich cinematic colors, professional portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, actual exposed skull, skeletal anatomy, gore, blood, rotting flesh, horror zombie, completely black eyes, excessive face paint obscuring all facial identity, distorted facial features, asymmetrical makeup`);
cb('cowboy',
  `photorealistic head-only portrait of a country western “Dirty Harry”, preserve the subject's recognizable facial identity, realistic skin pores and fine facial details, authentic weathered brown leather cowboy hat, sun-kissed skin, natural stubble, confident expressive eyes, subtle western bandana visible at the bottom of the frame, individual hair strands, warm golden-hour sunlight, cinematic shadows, shallow depth of field, authentic Old West atmosphere, professional editorial portrait photography, sharp focus`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll, plastic skin, artificial face, altered identity, exaggerated facial features, deformed eyes, distorted anatomy, oversized hat hiding the face, modern baseball cap, futuristic clothing, oversmoothed skin`);
cb('mera',
  `photorealistic head-only portrait of Aquaman's Princess Mera, preserve the subject's recognizable facial identity, realistic human skin texture, subtle iridescent aqua scales delicately embedded along the temples and cheeks, long flowing bright red hair, elegant seashell crown, natural facial anatomy, captivating eyes, pearlescent highlights, soft underwater cinematic lighting, realistic moisture and fine skin details, professional fantasy portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll, plastic skin, artificial face, altered identity, distorted facial features, asymmetrical eyes, extra eyes, deformed anatomy, excessive scales, fish body, oversaturated colors`);
cb('prince_adam',
  `Photorealistic head-only portrait of Prince Adam from Beauty and the Beast, preserve the character's recognizable facial identity, handsome aristocratic features, long wavy chestnut-brown hair, strong jawline, expressive blue eyes, thick eyebrows, slightly rugged masculine appearance, gentle yet solemn expression, hint of his iconic royal blue formal coat with gold trim, romantic fairytale atmosphere, soft cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, beast form, horns, animal muzzle, fur, blonde hair, modern clothing, exaggerated smile`);
cb('ryu',
  `Photorealistic head-only portrait of Ryu from Street Fighter, preserve the subject's recognizable facial identity, iconic red headband, short spiky black hair, thick eyebrows, rugged jawline, intense focused expression, subtle facial stubble, muscular neck, dramatic martial arts lighting, cinematic color grading, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, long hair, clean-shaven baby face, smiling`);
cb('chun_li',
  `Photorealistic head-only portrait of Chun-Li from Street Fighter, preserve the subject's recognizable facial identity, iconic dark brown hair styled in twin buns with white ribbons, strong expressive brown eyes, elegant oval face, confident determined expression, subtle makeup, signature blue outfit collar visible, realistic skin texture, cinematic martial arts lighting, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, loose hair, blonde hair, exaggerated facial features, excessive makeup, smiling`);
cb('ken_sf',
  `Photorealistic head-only portrait of Ken Masters from Street Fighter, preserve the subject's recognizable facial identity, signature shoulder-length golden-blond hair, strong angular jawline, athletic masculine features, confident competitive expression, piercing blue eyes, subtle facial stubble, hint of his iconic red martial arts gi, dramatic cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, black hair, short buzz cut, exaggerated muscles, feminine features`);
cb('kitana',
  `Photorealistic head-only portrait of Kitana from Mortal Kombat, preserve the subject's recognizable facial identity, long flowing jet-black hair, striking blue eyes, elegant royal features, poised and fierce expression, subtle blue eye makeup, ornate blue royal headpiece, hints of her iconic blue combat attire, dark fantasy atmosphere, dramatic cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, green eyes, exaggerated makeup, smiling`);
cb('trinity',
  `Photorealistic head-only portrait of Trinity from The Matrix, preserve the subject's recognizable facial identity, sleek short black hair, signature narrow black sunglasses, sharp cheekbones, pale complexion, serious confident expression, minimalist black leather outfit collar, subtle green-tinted cinematic color grading, moody high-contrast lighting, cyberpunk sci-fi film aesthetic, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, no sunglasses, long blonde hair, smiling, colorful clothing, soft pastel lighting`);
cb('darth_maul',
  `Photorealistic head-only portrait of Darth Maul from Star Wars, preserve the subject's recognizable facial identity, iconic red facial skin with intricate black geometric Sith tattoos, short crown of small horns, intense yellow eyes with dark pupils, menacing focused expression, sharply defined facial markings, dark Sith aesthetic, dramatic red and black cinematic lighting, realistic skin pores and tattoo details, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, human skin tone, missing tattoos, missing horns, blue eyes, friendly expression`);
cb('aladdin',
  `Photorealistic head-only portrait of Aladdin from Disney's Aladdin, preserve the character's recognizable facial identity, youthful Middle Eastern features, tousled jet-black hair, thick expressive eyebrows, warm brown eyes, charming confident smile, lightly tanned skin, hint of his iconic cream-colored fez-free streetwear and purple vest, subtle adventurous expression, warm cinematic Arabian Nights lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, blue eyes, exaggerated facial features, beard, modern clothing`);
cb('padme',
  `Photorealistic head-only portrait of Padmé Amidala from Star Wars, preserve the subject's recognizable facial identity, elegant symmetrical features, warm brown eyes, rich dark brown hair styled in her iconic elaborate royal updo, refined red-brown lipstick, regal composed expression, ornate Naboo royal costume details near the neckline, sophisticated science-fiction royal aesthetic, soft cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, modern casual hairstyle, exaggerated makeup, smiling broadly`);
cb('morticia',
  `Photorealistic head-only portrait of Morticia Addams from the Addams Family, preserve the subject's recognizable facial identity, very deathly pale skin, long sleek straight black hair, dark smoky eye makeup, bold crimson lips, severe elegant expression, moody gothic aesthetic, classic horror film aesthetic, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, tan skin, smiling, natural makeup`);
cb('cleopatra',
  `Photorealistic head-only portrait of Cleopatra, preserve the subject's recognizable facial identity, heavy iconic turquoise and gold Egyptian eyeliner, elaborate beaded gold headdress, dramatic arched eyebrows, deep red lipstick, regal Egyptian attire, cinematic lighting from the 1960s film, glamorous Hollywood aesthetic, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern clothing, natural makeup, messy hair`);
cb('galadriel',
  `Photorealistic head-only portrait of The Lord of the Rings’ Galadriel, the Elven Queen, preserve the subject's recognizable facial identity, ethereal glowing aura, long wavy platinum-blonde hair, piercing light blue eyes, regal Elven serenity, subtle silver tiara, fair radiant skin, soft diffused cinematic lighting, high-fantasy ethereal aesthetic, sharp focus, 8k resolution.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, dark hair, aggressive expression, messy hair`);
cb('moana',
  `photorealistic head-only portrait inspired by Moana, preserve the subject's recognizable facial identity and natural facial proportions, long thick naturally wavy dark brown hair, warm sun-kissed skin, subtle Polynesian-inspired woven headband, tasteful traditional island-inspired necklace visible at the bottom of the frame, determined adventurous expression, realistic skin pores and natural hair texture, warm tropical sunlight, softly blurred Pacific Ocean and lush island background, respectful Polynesian-inspired styling, live-action adventure film aesthetic, cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, exaggerated cultural markings, inaccurate costume, blonde hair, distorted facial features, excessive jewelry`);
cb('mary_poppins',
  `photorealistic head-only portrait of Mary Poppins, preserve the subject's recognizable facial identity and natural facial proportions, elegant dark hair neatly styled in a Victorian-inspired bun, classic dark hat adorned with small flowers, refined arched eyebrows, rosy cheeks, composed knowing smile, crisp white blouse collar and dark Edwardian coat visible at the bottom of the frame, subtle vintage beauty styling, realistic skin texture, soft overcast London lighting, softly blurred Edwardian street background, live-action period fantasy film aesthetic, professional portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, oversized hat hiding the face, messy hair, modern clothing, exaggerated makeup, distorted facial features`);
cb('elsa',
  `photorealistic head-only portrait inspired by Elsa from Frozen, preserve the subject's recognizable facial identity and natural facial proportions, iconic platinum blonde hair in an elegant thick side braid, a few delicate loose strands framing the face, pale icy-blue eyeshadow, subtle crystal snowflake hair accessory, shimmering ice-blue high collar visible at the bottom of the frame, serene confident expression, realistic skin pores and individual hair strands, cool winter daylight, delicate frost particles in the background, cinematic live-action fantasy aesthetic, natural photographic textures, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, plastic skin, altered identity, exaggerated eyes, messy braid, excessive ice crystals obscuring the face, frozen statue, distorted facial features`);
cb('jasmine',
  `photorealistic head-only portrait of Princess Jasmine from Aladdin, preserve the subject's recognizable facial identity and natural facial proportions, long glossy jet-black hair, iconic turquoise jeweled headband with a central blue gemstone, elegant gold drop earrings, striking almond-shaped eyes with softly defined eyeliner, rich turquoise outfit neckline visible at the bottom of the frame, confident regal expression, realistic skin pores and individual hair strands, warm golden palace lighting, softly blurred Arabian palace garden, live-action fantasy film aesthetic, luxury cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, exaggerated eyes, oversized jewelry, messy hair, distorted facial features, excessive makeup`);
cb('mirabel',
  `photorealistic head-only portrait inspired by Mirabel from Encanto, preserve the subject's recognizable facial identity and natural facial proportions, dark curly shoulder-length hair, round teal-rimmed eyeglasses, embroidered white blouse collar with colorful floral details visible at the bottom of the frame, playful expressive eyebrows, warm cheerful smile, subtle colorful butterfly-inspired embroidery near the neckline, realistic skin texture and individual curls, warm Colombian tropical sunlight, softly blurred colorful Colombian village background, authentic handcrafted costume details, live-action family fantasy film aesthetic, cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, doll face, altered identity, missing glasses, straight blonde hair, exaggerated eyes, distorted facial features, inaccurate embroidery`);
cb('belle',
  `photorealistic head-only portrait of Belle from Beauty and the Beast, preserve the subject's recognizable facial identity and natural facial proportions, chestnut-brown hair styled half-up with soft loose curls, delicate golden hair ribbon, warm expressive brown eyes, elegant golden-yellow ball gown neckline visible at the bottom of the frame, graceful intelligent expression, realistic skin pores and fine hair strands, soft candlelit highlights, softly blurred enchanted French castle ballroom, warm gold bokeh, live-action romantic fantasy film aesthetic, professional cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, plastic skin, altered identity, blonde hair, excessive jewelry, oversized hair accessories, distorted facial features, exaggerated makeup`);
cb('cinderella',
  `photorealistic head-only portrait of Cinderella, preserve the subject's recognizable facial identity and natural facial proportions, elegant blonde hair arranged in a classic soft updo, delicate pale blue headband, subtle sparkling crystal hair accessory, refined natural makeup, bright blue satin gown neckline visible at the bottom of the frame, graceful hopeful expression, realistic skin texture and fine hair strands, cool moonlit highlights mixed with warm ballroom lighting, softly blurred royal palace ballroom, delicate sparkling bokeh, live-action fairy-tale film aesthetic, professional portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, porcelain skin, altered identity, exaggerated makeup, oversized tiara, messy updo, distorted facial features, harsh artificial glow`);
cb('snow_white',
  `photorealistic head-only portrait of Snow White, preserve the subject's recognizable facial identity and natural facial proportions, glossy short black bob hairstyle, delicate red ribbon headband, natural fair skin with realistic pores, soft rosy cheeks, classic red lipstick, expressive dark eyes, blue and red costume collar with a small yellow accent visible at the bottom of the frame, gentle innocent expression, natural individual hair strands, soft forest daylight, blurred enchanted woodland with subtle apple-red accents, live-action fairy-tale film aesthetic, cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, plastic skin, altered identity, long blonde hair, oversized red bow, exaggerated rosy cheeks, distorted facial features, unnatural pale makeup`);
cb('wednesday',
  `photorealistic head-only portrait of Wednesday Addams, preserve the subject's recognizable facial identity and natural facial proportions, jet-black hair in two neat symmetrical braids, precise center part, very pale white skin, dark expressive eyes, subtle dark eye makeup, straight dark eyebrows, serious deadpan expression, crisp black dress collar with a white pointed collar visible at the bottom of the frame, cool gothic lighting, dark academia aesthetic, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, plastic skin, altered identity, blonde hair, loose curly hair, smiling expression, exaggerated gothic makeup, distorted facial features, messy braids`);
cb('queen_of_hearts',
  `photorealistic head-only portrait of the Queen of Hearts from Alice in Wonderland, preserve the subject's recognizable facial identity and natural facial proportions, elaborate red heart-shaped royal crown, voluminous dark hair styled in a regal updo, dramatic arched eyebrows, rich crimson lipstick, subtle heart-shaped beauty mark, luxurious red-and-black royal collar with gold trim visible at the bottom of the frame, imperious commanding expression, realistic skin texture, deep ruby and gold cinematic lighting, softly blurred extravagant royal palace, live-action dark fairy-tale film aesthetic, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, oversized heart hiding the face, distorted facial features, exaggerated head proportions, clown makeup, blood, gore`);
cb('winnie',
  `photorealistic head-only portrait of Winifred Winnie Sanderson from Hocus Pocus, preserve the subject's recognizable facial identity and natural facial proportions, iconic vivid copper-red hair styled in voluminous curls with a distinctive high curled silhouette, thin arched eyebrows, expressive green eyes, deep red lipstick, black medieval witch dress collar with subtle purple accents visible at the bottom of the frame, mischievous commanding expression, realistic skin texture and individual curls, warm flickering candlelight, softly blurred Salem witch cottage background, live-action Halloween fantasy film aesthetic, cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, altered identity, blonde hair, straight hair, missing red curls, exaggerated witch nose, grotesque wrinkles, distorted facial features, green monster skin`);
cb('glinda',
  `photorealistic head-only portrait of Glinda, also known as Galinda, from Wicked, preserve the subject's recognizable facial identity and natural facial proportions, long glossy blonde hair styled in soft elegant waves, delicate sparkling silver-pink tiara, luminous rosy makeup, soft pink lipstick, refined eyebrows, elegant pink satin gown neckline visible at the bottom of the frame, graceful radiant smile, realistic skin pores and fine hair strands, subtle pearlescent highlights, dreamy rose-gold lighting, softly blurred magical Emerald City-inspired palace background, luxurious live-action musical fantasy film aesthetic, professional cinematic portrait photography, sharp focus, highly detailed`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, doll face, plastic skin, altered identity, exaggerated eyes, oversized tiara, excessive glitter covering the face, messy blonde hair, distorted facial features, harsh makeup`);
cb('elphaba',
  `Photorealistic head-only portrait Wicked's Elphaba, preserve the subject's recognizable facial identity, green skin with realistic natural texture, long flowing black hair, piercing green eyes, defined cheekbones, arched eyebrows, intense intelligent expression, iconic tall black pointed witch hat, subtle dark eye makeup, hints of her black witch's clothing at the neckline, dramatic emerald and black cinematic color grading, moody theatrical lighting, realistic skin pores, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, normal human skin tone, bright lime-green skin, blonde hair, missing witch hat, exaggerated nose, excessive wrinkles, goofy expression`);
cb('pocahontas',
  `Photorealistic head-only portrait of Pocahontas from Disney's Pocahontas, preserve the subject's recognizable facial identity, long flowing raven-black hair, warm copper-brown skin, high cheekbones, expressive dark brown eyes, strong elegant facial features, turquoise necklace, red-brown earthy color palette, calm confident expression, subtle wind-swept hair, natural skin texture, warm cinematic lighting inspired by the natural landscapes of North America, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, blue eyes, pale skin, exaggerated makeup, modern clothing`);
cb('mulan',
  `Photorealistic head-only portrait of Mulan from Disney's Mulan, preserve the subject's recognizable facial identity, straight jet-black hair, dark expressive almond-shaped eyes, delicate yet determined facial features, smooth natural skin texture, elegant traditional Chinese hairstyle, subtle red lipstick, composed courageous expression, hints of an ornate red and blue traditional Hanfu-inspired collar, refined Chinese cultural details, cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, blue eyes, Western facial features, excessive makeup, modern hairstyle, exaggerated smile`);
cb('jessica_rabbit',
  `photorealistic head-only portrait of Jessica Rabbit from Who Framed Roger Rabbit, reimagined as a realistic live-action woman, preserve the subject's recognizable facial identity and natural facial proportions, voluminous long red hair swept dramatically to one side, glamorous side-parted waves, violet eyeshadow, elegant arched eyebrows, glossy red lipstick, long lashes, sparkling diamond earrings, red satin evening gown neckline visible at the bottom of the frame, sultry confident expression, realistic skin pores and natural facial anatomy, luxurious Hollywood studio lighting, softly blurred upscale nightclub background, classic 1940s glamour photography, live-action film aesthetic, sharp focus, highly detailed`,
  `cartoon, anime, 3D CGI, illustration, painting, exaggerated animated proportions, plastic skin, doll face, altered identity, oversized eyes, unnaturally tiny waist, distorted facial features, excessive cleavage, messy red hair, artificial makeup`);
cb('helen_of_troy',
  `Photorealistic head-only portrait of Helen of Troy from Greek mythology, preserve the subject's recognizable facial identity, legendary classical Greek beauty, long flowing golden-blonde hair, luminous fair skin, symmetrical facial features, captivating hazel-green eyes, delicate nose, full natural lips, elegant cheekbones, serene yet alluring expression, ornate ancient Greek gold hair ornaments, subtle golden laurel accents, hints of an ivory and gold ancient Greek gown, mythological royal elegance, soft cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern clothing, modern hairstyle, exaggerated makeup, overly glossy skin, exaggerated facial proportions, smiling broadly`);
cb('medusa',
  `Photorealistic head-only portrait of Medusa from Greek mythology, preserve the subject's recognizable facial identity, mesmerizing piercing green eyes, pale olive skin, sharp sculpted cheekbones, intense hypnotic expression, living venomous snakes intertwined throughout her dark hair, intricately detailed serpent scales, subtle ancient Greek gold ornaments, dark mythological atmosphere, dramatic cinematic lighting with emerald highlights, realistic skin and reptilian textures, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, ordinary human hair, no snakes, snake body, snake replacing entire face, exaggerated fangs, goofy expression, excessive gore`);
cb('peach',
  `Photorealistic head-only portrait of Princess Peach from Super Mario, preserve the subject's recognizable facial identity, long flowing golden-blonde hair, large expressive blue eyes, delicate oval face, rosy cheeks, elegant eyebrows, warm confident smile, iconic gold crown with red and blue gemstones, round pearl earrings, hints of her signature pink royal gown at the neckline, polished fairytale princess aesthetic, soft luminous cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, brown hair, black hair, green eyes, missing crown, masculine features, excessive makeup, exaggerated facial proportions`);
cb('aurora',
  `Photorealistic head-only portrait of Princess Aurora from Disney's Sleeping Beauty, preserve the subject's recognizable facial identity, long flowing golden-blonde hair, delicate arched eyebrows, violet-blue eyes, graceful oval face, fair luminous skin, soft rosy lips, serene dreamy expression, elegant golden tiara, subtle hints of her iconic pink royal gown at the neckline, romantic enchanted fairytale atmosphere, soft golden cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, black hair, brown hair, green eyes, missing tiara, heavy makeup, exaggerated smile, modern clothing`);
cb('zeus',
  `Photorealistic head-only portrait of Zeus from Greek mythology, preserve the subject's recognizable facial identity, mature powerful face, long flowing white hair, thick silver-white beard, piercing electric-blue eyes, heavy brows, strong jawline, commanding expression, subtle golden crown, hints of ornate gold armor at the neckline, faint lightning illuminating his face, majestic Mount Olympus atmosphere, dramatic high-contrast cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, black beard, youthful face, clean-shaven, weak jawline, modern clothing, smiling`);
cb('rapunzel',
  `Photorealistic head-only portrait of Rapunzel from Disney's Tangled, preserve the subject's recognizable facial identity, exceptionally long golden-blonde hair with subtle luminous highlights, large expressive green eyes, fair skin, delicate oval face, rosy cheeks, soft pink lips, youthful curious expression, small purple flower accents woven into her hair, hints of her iconic lavender dress at the neckline, enchanting fairytale atmosphere, warm golden cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, short black hair, brown eyes, dark skin, exaggerated facial proportions, heavy makeup, modern clothing`);
cb('megara',
  `Photorealistic head-only portrait of Megara from Disney's Hercules, preserve the subject's recognizable facial identity, voluminous deep auburn-purple hair styled in her iconic high ponytail, expressive violet eyes, arched eyebrows, elegant angular face, defined cheekbones, warm olive complexion, confident sarcastic smirk, subtle purple eye makeup, hints of her signature lavender Greek-inspired dress at the neckline, ancient Greek mythological atmosphere, warm cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, bright blue eyes, short hair, exaggerated makeup, childish facial features, modern clothing`);
cb('storm',
  `Photorealistic head-only portrait of Storm from X-Men, preserve the subject's recognizable facial identity, deep brown skin, iconic flowing white-silver hair, piercing ice-blue eyes, high cheekbones, elegant facial features, powerful commanding expression, subtle metallic accents inspired by her superhero costume, faint atmospheric electricity illuminating her face, storm clouds in the background, dramatic cinematic lighting with cool blue highlights, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, black hair, blonde hair, pale skin, brown eyes, missing white hair, excessive lightning obscuring face`);
cb('austin_powers',
  `Photorealistic head-only portrait of Austin Powers, preserve the subject's recognizable facial identity, iconic shaggy light-brown hair, thick black-rimmed glasses, prominent front teeth, expressive blue eyes, cheeky mischievous grin, distinctive 1960s mod-inspired style, high-collared frilly shirt with a colorful velvet jacket visible at the neckline, playful retro British spy aesthetic, warm vintage cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, no glasses, slicked-back hair, serious expression, closed-mouth expression hiding teeth, modern minimalist clothing`);
cb('santa',
  `Photorealistic head-only portrait of Santa Claus, preserve the subject's recognizable facial identity, kind elderly face, thick fluffy white beard and mustache, rosy cheeks, warm twinkling blue eyes, bushy white eyebrows, cheerful welcoming expression, classic red Santa hat with soft white fur trim, subtle red velvet coat collar, realistic individual beard hairs, warm Christmas lights softly glowing in the background, cozy festive cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, black beard, clean-shaven, young face, sinister expression, missing Santa hat, green clothing, exaggerated facial proportions`);
cb('mrs_claus',
  `Photorealistic head-only portrait of Mrs. Claus, preserve the subject's recognizable facial identity, warm elderly face, soft silver-white hair styled in a neat bun, kind sparkling blue eyes, rosy cheeks, gentle smile, delicate wrinkles, round spectacles, traditional red velvet bonnet with white fur trim, subtle red winter dress collar, cozy grandmotherly elegance, softly glowing Christmas lights in the background, warm festive cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, young face, dark hair, exaggerated wrinkles, heavy makeup, sinister expression, missing bonnet, modern fashion`);
cb('marie_antoinette',
  `Photorealistic head-only portrait of Marie Antoinette, preserve the subject's recognizable facial identity, elaborate towering powdered blonde hair styled in an 18th-century French court coiffure, fair porcelain complexion, delicate blue-gray eyes, rosy cheeks, refined aristocratic features, elegant composed expression, ornate jeweled hair ornaments, pearl earrings, intricate lace and embroidered silk gown collar, opulent Versailles-inspired atmosphere, soft golden candlelight, historically inspired Rococo elegance, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern hairstyle, short hair, dark contemporary clothing, modern jewelry, excessive cosmetic contouring, exaggerated facial features`);
cb('scheherazade',
  `Photorealistic head-only portrait of Scheherazade from One Thousand and One Nights, preserve the subject's recognizable facial identity, long flowing raven-black hair, luminous warm olive skin, expressive dark almond-shaped eyes, elegant arched eyebrows, graceful cheekbones, intelligent enchanting expression, intricate gold forehead jewelry, delicate jeweled veil framing her hair, ornate Middle Eastern-inspired earrings, subtle embroidered silk collar with gold detailing, magical ancient Persian royal atmosphere, rich amber and sapphire cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, blue eyes, modern hairstyle, modern clothing, excessive jewelry obscuring facial features, exaggerated makeup, stereotypical caricature`);
cb('catherine',
  `Photorealistic head-only portrait of Catherine the Great, preserve the subject's recognizable facial identity, elaborate powdered light-brown hair styled in an 18th-century Russian imperial coiffure, fair complexion, blue-gray eyes, defined cheekbones, refined aristocratic facial features, intelligent commanding expression, ornate imperial diamond tiara, pearl earrings, embroidered royal gown collar with gold and jewel accents, dignified Russian Empress aesthetic, opulent imperial palace atmosphere, dramatic soft golden lighting, historically inspired 18th-century portraiture, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern hairstyle, contemporary clothing, casual accessories, oversized crown obscuring face, excessive modern makeup, exaggerated facial proportions`);
cb('genghis_khan',
  `Photorealistic head-only portrait of Genghis Khan, preserve the subject's recognizable facial identity, rugged Mongolian facial features, long dark hair tied back, thick mustache and short beard, strong cheekbones, deep-set dark brown eyes, weathered tan skin, stern commanding expression, traditional Mongolian fur-trimmed leather headwear, hints of an authentic 13th-century Mongolian warrior robe near the neckline, subtle wind-swept hair, steppe-inspired atmosphere, dramatic earthy cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, blonde hair, blue eyes, clean-shaven face, exaggerated fantasy horns, samurai helmet, European medieval armor, modern clothing`);
cb('akbar',
  `Photorealistic head-only portrait of Akbar the Great, preserve the subject's recognizable facial identity, historically inspired 16th-century Mughal royal appearance, neatly trimmed dark mustache, strong rounded facial features, deep brown eyes, warm brown complexion, broad forehead, dignified thoughtful expression, richly embroidered Mughal turban adorned with a central jeweled ornament, elegant pearl and gemstone accessories, hints of an ornate royal robe with intricate gold embroidery near the neckline, imperial Mughal court atmosphere, warm golden cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, clean-shaven modern appearance, European royal crown, medieval European armor, modern clothing, oversized jewelry obscuring face, exaggerated facial features`);
cb('charlemagne',
  `Photorealistic head-only portrait of Charlemagne, preserve the subject's recognizable facial identity, mature early medieval European features, shoulder-length dark brown hair with subtle gray strands, thick mustache, strong broad face, deep-set brown eyes, prominent nose, commanding thoughtful expression, simple gold circlet, hints of a richly textured Carolingian royal mantle with embroidered trim near the neckline, historically inspired 8th-century Frankish imperial aesthetic, muted earthy color palette, dramatic natural cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern hairstyle, clean-shaven face, oversized fantasy crown, Renaissance wig, elaborate 18th-century powdered hair, modern suit, exaggerated facial features`);
cb('ramesses',
  `Photorealistic head-only portrait of Ramesses II, preserve the subject's recognizable facial identity, powerful ancient Egyptian royal features, broad face, prominent nose, defined cheekbones, warm bronze-brown complexion, intense dark eyes, composed authoritative expression, traditional striped nemes headdress in blue and gold, ornate Egyptian ceremonial collar with intricate lapis-blue and gold details, subtle royal eyeliner inspired by ancient Egyptian customs, faint weathered stone and temple textures in the background, majestic New Kingdom Egyptian atmosphere, dramatic golden cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, European facial features, medieval crown, Roman laurel wreath, modern hairstyle, modern clothing, excessive fantasy jewelry, exaggerated eyeliner`);
cb('ken_barbie',
  `Photorealistic head-only portrait of Ken from Barbie, preserve the subject's recognizable facial identity, perfectly styled sun-kissed blond hair, bright blue eyes, defined jawline, symmetrical handsome features, smooth youthful complexion, confident charming smile, subtle beach-boy aesthetic, hints of a pastel blue collared shirt at the neckline, polished Malibu fashion style, bright cinematic lighting, realistic skin pores and natural facial details, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, dark messy hair, exaggerated muscles, heavy beard, deep wrinkles, sinister expression, overly glossy skin`);
cb('louis_xiv',
  `Photorealistic head-only portrait of Louis XIV, the Sun King of France, preserve the subject's recognizable facial identity, long dark brown hair styled in an elaborate 17th-century royal wig, dignified oval face, dark expressive eyes, prominent nose, refined aristocratic features, confident regal expression, subtle natural facial lines, ornate gold-embroidered royal collar, luxurious lace cravat, jeweled royal attire, opulent Versailles-inspired atmosphere, warm golden candlelight, historically inspired Baroque portrait aesthetic, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern haircut, short casual hair, modern business suit, powdered 18th-century hairstyle, oversized crown obscuring face, exaggerated makeup`);
cb('cyndi_lauper',
  `Photorealistic head-only portrait of Cyndi Lauper in her 1983 "Girls Just Want to Have Fun" music video, preserve the subject's recognizable facial identity, iconic wild multicolored strawberry-blonde hair with vivid orange and pink streaks, voluminous teased 1980s hairstyle, expressive blue eyes, playful mischievous smile, fair skin, bold colorful 1980s makeup, bright lipstick, oversized mismatched earrings, eccentric punk-pop fashion, hints of her colorful layered outfit near the neckline, vibrant retro music video aesthetic, bright energetic cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, sleek modern hairstyle, plain brown hair, minimalist makeup, monochrome styling, mature formal appearance, dull expression`);
cb('madonna',
  `Photorealistic head-only portrait of Madonna in her 1984 "Like a Virgin" music video, preserve the subject's recognizable facial identity, iconic tousled blonde hair with dark roots, expressive blue eyes, defined eyebrows, youthful 1980s facial features, playful confident expression, bold red lipstick, layered silver necklaces, distinctive black ribbon choker, large cross pendant earrings, white lace and satin bridal-inspired outfit details near the neckline, signature 1980s pop fashion aesthetic, soft glamorous cinematic lighting, realistic skin texture, sharp focus, ultra-detailed.`,
cb('nuwa',
  `Photorealistic head-only portrait of Nüwa (Nügua), the ancient Chinese creator goddess, preserve the subject's recognizable facial identity, elegant divine Chinese features, intricate traditional black hair arranged in an elaborate ancient Chinese updo, ornate gold phoenix crown, delicate jade hairpins, flowing silk ribbons, refined red and gold imperial robes visible around the shoulders, subtle serpent-inspired scales gracefully blending along the sides of the neck and jawline, luminous jade-green accents, wise and compassionate expression, mythological Chinese elegance, celestial golden lighting, majestic ancient Chinese atmosphere, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern hairstyle, modern clothing, Western royal crown, exaggerated snake head, full snake body, monstrous face, horror gore`);
cb('geisha',
  `Photorealistic head-only portrait of a traditional Japanese geisha, preserve the subject's recognizable facial identity, elegant jet-black hair styled in a traditional shimada updo, delicate ornamental kanzashi hairpins, refined white oshiroi makeup, precisely defined red lips, subtle red accents around the eyes, graceful dark eyes, composed and dignified expression, luxurious silk kimono collar with intricate traditional Japanese patterns, tasteful red and gold details, soft lantern lighting, authentic Japanese cultural elegance, cinematic portrait photography, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern hairstyle, modern makeup, Western bridal dress, exaggerated makeup, costume caricature, Chinese imperial crown`);
cb('korean_empress',
  `Photorealistic head-only portrait of a Korean empress inspired by the Korean Empire's late Joseon-era royal court, preserve the subject's recognizable facial identity, elegant Korean facial features, traditional dark hair arranged in a refined royal updo, ornate gold royal hair ornaments, delicate jade and pearl accessories, luxurious crimson and gold ceremonial hanbok, intricate embroidered collar, dignified and commanding expression, understated traditional Korean makeup, historically inspired Korean imperial elegance, rich silk textures, warm palace lighting, majestic royal atmosphere, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, Japanese geisha makeup, Chinese phoenix crown, European tiara, modern hairstyle, modern clothing, exaggerated accessories, inaccurate fantasy armor`);
cb('shangdi',
  `Photorealistic head-only portrait of Shàngdì (Tàidì), the supreme God of Heaven in ancient Chinese religious tradition, preserve the subject's recognizable facial identity, majestic East Asian male features, long flowing silver-white hair and beard, profound wise eyes, serene yet commanding expression, elaborate ancient Chinese celestial crown adorned with gold and jade ornaments, luxurious golden imperial robes visible around the shoulders, intricate heavenly cloud and dragon embroidery, subtle celestial radiance surrounding the head, ethereal golden light, majestic heavenly palace atmosphere, divine authority and timeless wisdom, cinematic portrait photography, realistic skin texture, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, clean-shaven face, modern hairstyle, Western royal crown, European armor, Japanese samurai outfit, demonic appearance, exaggerated fantasy monster features, excessive glowing effects`);
cb('prince_charming',
  `Photorealistic head-only portrait of the classic fairy-tale Prince Charming, preserve the subject's recognizable facial identity, exceptionally handsome young royal with symmetrical features, strong jawline, clear blue eyes, neatly styled golden-blond hair swept back, clean-shaven face, confident romantic expression, elegant royal blue and white ceremonial jacket with intricate gold embroidery, high collar, jeweled accents, polished aristocratic appearance, refined European fairy-tale prince aesthetic, soft golden rim lighting, luxurious storybook palace atmosphere, realistic skin texture, cinematic portrait photography, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, beard, heavy mustache, messy unkempt hair, dark gothic clothing, villainous expression, modern casual clothing, armor helmet, exaggerated facial features`);
cb('mozart',
  `Photorealistic head-only portrait of Wolfgang Amadeus Mozart, preserve the subject's recognizable facial identity and historical appearance, 18th-century Austrian composer with a pale complexion, expressive dark eyes, refined facial features, powdered white hair styled in an elaborate period wig with curled sides and a tied-back ponytail, clean-shaven face, confident intellectual expression, elegant 18th-century aristocratic attire with a high white cravat, richly textured burgundy coat with gold embroidery, authentic Classical-era European fashion, warm candlelit ambiance, subtle Baroque portrait-painting atmosphere rendered as realistic photography, natural skin texture, cinematic lighting, sharp focus, ultra-detailed.`,
  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, modern haircut, modern clothing, facial hair, beard, mustache, long loose hair, contemporary suit, exaggerated expression, fantasy costume, musical instruments covering the face`);

  `cartoon, anime, Pixar, 3D CGI, illustration, painting, plastic skin, artificial face, altered identity, dark brunette hair, modern minimalist styling, no jewelry, heavy aging effects, exaggerated makeup, contemporary fashion`);

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      version: 'photomaker-style-v12',
      couldBeCount: Object.keys(COULD_BE).length,
      emojiCount: EMOJI_PROMPTS.length,
      artistCount: Object.keys(ARTIST_PLAN).length,
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    if (!process.env.REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN is not set on Vercel');
    const { photo_base64, emojis, artist, could_be } = req.body || {};
    if (could_be) {
      const who = String(could_be).trim().slice(0, 60);
      const cbPlan = COULD_BE[who];
      if (!photo_base64 || !cbPlan) {
        return res.status(400).json({ error: `Unknown character or missing photo: ${who}` });
      }
      const cbImage = photo_base64.startsWith('data:')
        ? photo_base64
        : `data:image/jpeg;base64,${photo_base64}`;
      const cbInput = {
        prompt: cbPlan.prompt,
        main_face_image: cbImage,
        negative_prompt: cbPlan.negative,
        num_samples: 1,
      };
      const cbUrl = process.env.PULID_VERSION
        ? await runPrediction(process.env.PULID_VERSION, cbInput)
        : await runPrediction(null, cbInput, PULID_URL);
      const cbBuf = Buffer.from(await (await fetch(cbUrl)).arrayBuffer());
      return res.status(200).json({ image_base64: cbBuf.toString('base64') });
    }
    if (artist) {
      const plan = ARTIST_PLAN[artist];
      if (!photo_base64 || !plan) {
        return res.status(400).json({ error: `Unknown artist or missing photo: ${artist}` });
      }
      const artImage = photo_base64.startsWith('data:')
        ? photo_base64
        : `data:image/jpeg;base64,${photo_base64}`;
      let artUrl;
      if (PULID_ARTISTS.has(artist)) {
        const pulidInput = {
          prompt: plan.prompt,
          main_face_image: artImage,
          negative_prompt: plan.negative || ART_NEG,
          num_samples: 1,
        };
        artUrl = process.env.PULID_VERSION
          ? await runPrediction(process.env.PULID_VERSION, pulidInput)
          : await runPrediction(null, pulidInput, PULID_URL);
      } else if (plan.model === 'kontext') {
        artUrl = await runPrediction(null, {
          prompt: plan.prompt,
          input_image: artImage,
          output_format: 'jpg',
          safety_tolerance: 2,
        }, KONTEXT_URL);
      } else if (plan.model === 'instantid') {
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
    const entry = lookup(emoji);
    if (!entry) return res.status(400).json({ error: `No prompt defined for emoji ${emoji}` });

    const image = photo_base64.startsWith('data:')
      ? photo_base64
      : `data:image/jpeg;base64,${photo_base64}`;

    // Every emoji runs on PhotoMaker-style. PHOTOMAKER_STYLE_VERSION is preferred;
    // PHOTOMAKER_VERSION is used when the style version is not set.
    const styleVersion = process.env.PHOTOMAKER_STYLE_VERSION;
    const version = styleVersion || process.env.PHOTOMAKER_VERSION;
    if (!version) throw new Error('PHOTOMAKER_STYLE_VERSION is not set on Vercel');
    const input = {
      [PHOTOMAKER_IMAGE_FIELD]: image,
      prompt: entry.prompt,
      negative_prompt: `${entry.negative}, ${NEG_COMMON}`,
      num_outputs: 1,
    };
    if (styleVersion) input.style_name = '(No style)';
    const outputUrl = await runPrediction(version, input);

    const img = await fetch(outputUrl);
    const buf = Buffer.from(await img.arrayBuffer());
    return res.status(200).json({ image_base64: buf.toString('base64') });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
