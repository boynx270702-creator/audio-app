const { Communicate } = require('edge-tts-ts');

async function test() {
  try {
    console.log('Testing edge-tts-ts...');
    const voices = await Communicate.getVoices();
    console.log('Voices found:', voices.length);
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
