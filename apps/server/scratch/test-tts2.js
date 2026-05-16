const { Communicate } = require('edge-tts-ts');

async function test() {
  const voice = 'vi-VN-HoaiNeural';
  const text = 'Xin chào bạn, đây là giọng đọc thử nghiệm.';
  
  console.log(`Testing voice: ${voice}`);
  console.log(`Text: ${text}`);
  
  const communicate = new Communicate(text, { voice });
  const chunks = [];
  let chunkCount = 0;
  
  try {
    for await (const chunk of communicate.stream()) {
      chunkCount++;
      console.log(`Chunk ${chunkCount}: type=${chunk.type}${chunk.type === 'audio' ? `, size=${chunk.data?.length}` : ''}`);
      if (chunk.type === 'audio') {
        chunks.push(Buffer.from(chunk.data));
      }
    }
    
    const total = Buffer.concat(chunks).length;
    console.log(`\nTotal chunks: ${chunkCount}`);
    console.log(`Total audio bytes: ${total}`);
    
    if (total === 0) {
      console.log('\nERROR: No audio received. Possible causes:');
      console.log('1. Microsoft Edge TTS service might be blocking requests');
      console.log('2. Voice name might be incorrect');
      console.log('3. Network connectivity issue');
    } else {
      console.log('\nSUCCESS: Audio received!');
    }
  } catch (err) {
    console.error('EXCEPTION:', err.message);
  }
}

test();
