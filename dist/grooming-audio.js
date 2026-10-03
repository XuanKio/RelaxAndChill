export function createGroomingAudio(button) {
  let enabled=true;
  let context=null,engineNodes=[];
  try{enabled=localStorage.getItem('chill-sound')!=='off';}catch{}
  const tracks={brush:document.createElement('audio'),pet:document.createElement('audio')};
  for(const [mode,audio] of Object.entries(tracks)){
    audio.src=mode==='brush'?'assets/audio/brushing.mp3':'assets/audio/purring.mp3';
    audio.loop=true;audio.preload='none';audio.hidden=true;audio.dataset.sound=mode;
    document.body.append(audio);
  }
  function stop(){for(const audio of Object.values(tracks)){audio.pause();audio.volume=0;}for(const node of engineNodes){try{node.stop();}catch{}node.disconnect();}engineNodes=[];}
  function sync(){button.textContent=enabled?'🔊':'🔇';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Tắt âm thanh':'Bật âm thanh');}
  function prime(mode){if(!enabled)return;stop();const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext){context ||= new AudioContext();context.resume().catch(()=>{});}const audio=tracks[mode];audio.volume=0;audio.play().catch(()=>{});}
  button.onclick=()=>{enabled=!enabled;stop();try{localStorage.setItem('chill-sound',enabled?'on':'off');}catch{}sync();};
  sync();
  return {prime,stop,engine(){
    if(!enabled||!context||context.state!=='running')return;
    const now=context.currentTime,osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
    osc.type='sawtooth';osc.frequency.setValueAtTime(65,now);osc.frequency.linearRampToValueAtTime(110,now+.2);osc.frequency.linearRampToValueAtTime(80,now+.35);osc.frequency.exponentialRampToValueAtTime(190,now+1);
    filter.type='lowpass';filter.frequency.value=650;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.065,now+.06);gain.gain.setValueAtTime(.065,now+.65);gain.gain.exponentialRampToValueAtTime(.001,now+1.25);
    osc.connect(filter);filter.connect(gain);gain.connect(context.destination);osc.start();osc.stop(now+1.3);engineNodes=[osc];osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();};
  },tick(mode,active,comfort,dt){
    const audio=tracks[mode],target=enabled&&active?(mode==='brush'?.25:.16+comfort/100*.2):0;
    audio.volume+=(target-audio.volume)*(1-Math.exp(-dt*12));
  }};
}
