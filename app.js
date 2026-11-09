//<![CDATA[
(function(){
  /* iPhone pinch-zoom band */
  ['gesturestart','gesturechange','gestureend'].forEach(function(ev){
    document.addEventListener(ev, function(e){ e.preventDefault(); });
  });

  var home = document.getElementById('home');
  var watch = document.getElementById('watch');
  if(!home || !watch) return;

  /* ===== HERO BACKGROUND IMAGE =====
     Apni (ya licensed) poster image ka https URL yahan daalo, jaise Blogger me
     upload karke mila link. Khaali chhodoge to CSS wala design dikhega. */
  var HERO_IMG = 'assets/hero.jpg';;
  if(HERO_IMG){
    var hero = document.getElementById('hero');
    hero.className += ' hasimg';
    hero.querySelector('.bg').style.cssText =
      "background:#0a1020 url('" + encodeURI(HERO_IMG) + "') center/cover no-repeat";
  }
  var player = document.getElementById('player');
  var ph = document.getElementById('ph');
  var phmsg = document.getElementById('phmsg');
  var list = document.getElementById('chlist');
  var status = document.getElementById('chstatus');
  var moreBtn = document.getElementById('moreBtn');
  var hls = null, lastY = 0;

  var PAGE = 40, shown = 0, CH = [], FILTERED_CH = [];

  function clearPlayer(){
    if(hls){ try{ hls.destroy(); }catch(e){} hls = null; }
    var old = player.querySelectorAll('iframe,video');
    for(var k = 0; k < old.length; k++) player.removeChild(old[k]);
  }
  function showMsg(t){ ph.className = 'ph'; phmsg.textContent = t || ''; }

  function play(name, src){
    clearPlayer();
    if(home.className.indexOf('hidden') < 0) lastY = window.pageYOffset || 0;
    document.getElementById('wtitle').textContent = name;
    home.className = 'hidden';
    watch.className = '';
    window.scrollTo(0,0);

    if(!src){
      showMsg('Is channel ka stream URL abhi set nahi hai. Back dabake koi doosra channel chuno.');
      return;
    }
    if(!/\.m3u8(\?|$)/i.test(src)){
      ph.className = 'ph hidden';
      var f = document.createElement('iframe');
      f.src = src;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      player.appendChild(f);
      return;
    }

    showMsg('Loading...');
    var v = document.createElement('video');
    v.controls = true; v.autoplay = true; v.muted = false;
    v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    player.appendChild(v);

    var failed = false, triedNative = false, timer = null;
    function fail(){
      if(failed) return; failed = true;
      if(timer) clearTimeout(timer);
      if(hls){ try{ hls.destroy(); }catch(e){} hls = null; }
      if(v.parentNode) v.parentNode.removeChild(v);
      showMsg('Ye channel abhi nahi chal raha (band ya block hai). Doosra channel try karo.');
    }
    function native(){
      if(triedNative) return fail();
      triedNative = true;
      if(hls){ try{ hls.destroy(); }catch(e){} hls = null; }
      v.src = src;
      v.load();
      var p = v.play(); if(p && p.catch) p.catch(function(){});
    }
    v.addEventListener('playing', function(){
      failed = false; if(timer) clearTimeout(timer);
      ph.className = 'ph hidden';
    });
    v.addEventListener('error', function(){ if(hls) return; fail(); });

    timer = setTimeout(function(){
      if(v.paused || v.readyState < 3){ if(!triedNative) native(); else fail(); }
    }, 15000);

    if(window.Hls && Hls.isSupported()){
      hls = new Hls({enableWorker:true, lowLatencyMode:false});
      hls.on(Hls.Events.ERROR, function(e, d){
        if(d && d.fatal) native();
      });
      hls.on(Hls.Events.MANIFEST_PARSED, function(){
        var p = v.play(); if(p && p.catch) p.catch(function(){});
      });
      hls.loadSource(src);
      hls.attachMedia(v);
    }else{
      triedNative = true;
      v.src = src;
      var p = v.play(); if(p && p.catch) p.catch(function(){});
    }
  }
  function openChannel(name, srcs){
    var box = document.getElementById('servers');
    box.innerHTML = '';
    if(srcs.length > 1){
      box.className = 'servers';
      srcs.forEach(function(sr, i){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sbtn' + (i === 0 ? ' on' : '');
        b.textContent = 'Server ' + (i + 1);
        b.onclick = function(){
          for(var k = 0; k < box.children.length; k++) box.children[k].className = 'sbtn';
          b.className = 'sbtn on';
          play(name, sr);
        };
        box.appendChild(b);
      });
    }else{
      box.className = 'servers hidden';
    }
    play(name, srcs[0]);
  }
  function backHome(){
    clearPlayer();
    watch.className = 'hidden';
    home.className = '';
    window.scrollTo(0, lastY);
  }

  function initials(n){
    var w = n.replace(/[^A-Za-z0-9 ]/g,' ').trim().split(/\s+/);
    return ((w[0]||'TV').charAt(0) + (w[1] ? w[1].charAt(0) : (w[0]||'V').charAt(1) || '')).toUpperCase();
  }
  function makeCard(ch){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ccard';
    b.innerHTML = '<div class="clogo"></div><div class="cinfo"><div class="cname"></div><div class="ccat"></div></div>';
    b.querySelector('.cname').textContent = ch.name;
    b.querySelector('.ccat').textContent = ch.group || 'Live TV';
    var logo = b.querySelector('.clogo');
    function fallback(){
      logo.innerHTML = '<div class="fb" style="background:linear-gradient(145deg,#ff5a1f,#c4181b)"></div>';
      logo.firstChild.textContent = initials(ch.name);
    }
    if(ch.logo && /^https:/.test(ch.logo)){
      var im = new Image(); im.alt = ''; im.loading = 'lazy';
      im.onerror = fallback; im.src = ch.logo; logo.appendChild(im);
    }else{ fallback(); }
    b.onclick = function(){ openChannel(ch.name, [ch.url]); };
    return b;
  }
  function renderMore(){
    var end = Math.min(shown + PAGE, FILTERED_CH.length);
    for(; shown < end; shown++){
      var card = makeCard(FILTERED_CH[shown]);
      card.setAttribute('data-dynamic-channel','1');
      list.appendChild(card);
    }
    moreBtn.className = shown < FILTERED_CH.length ? 'wbtn' : 'wbtn hidden';
  }
  function filterChannels(){
    var term = document.getElementById('channelSearch').value.toLowerCase().trim();
    var staticCards = list.querySelectorAll('.ccard[data-embed]');
    var visibleStatic = 0;
    for(var i = 0; i < staticCards.length; i++){
      var label = (staticCards[i].getAttribute('data-name') || staticCards[i].textContent || '').toLowerCase();
      staticCards[i].style.display = !term || label.indexOf(term) !== -1 ? '' : 'none';
      if(staticCards[i].style.display !== 'none') visibleStatic++;
    }
    FILTERED_CH = CH.filter(function(ch){
      return !term || (ch.name + ' ' + (ch.group || '')).toLowerCase().indexOf(term) !== -1;
    });
    var oldCards = list.querySelectorAll('.ccard[data-dynamic-channel]');
    for(var j = 0; j < oldCards.length; j++) oldCards[j].parentNode.removeChild(oldCards[j]);
    shown = 0;
    renderMore();
    if(term && !visibleStatic && !FILTERED_CH.length){
      status.className = 'status';
      status.textContent = 'Koi matching channel nahi mila';
    }else{
      status.className = 'hidden';
    }
  }

  function attr(line, key){
    var re = new RegExp('(?:^|\\s)' + key + '="([^"]*)"', 'i');
    var match = line.match(re);
    return match ? match[1] : '';
  }
  function parse(text){
    var lines = text.split(/\r?\n/), meta = null, seen = {}, out = [];
    for(var i = 0; i < lines.length; i++){
      var line = lines[i].trim();
      if(line.indexOf('#EXTINF:') === 0){
        var comma = line.lastIndexOf(',');
        meta = {
          name: comma >= 0 ? line.slice(comma + 1).trim() : '',
          logo: attr(line, 'tvg-logo'),
          group: attr(line, 'group-title')
        };
      }else if(line && line.charAt(0) !== '#' && meta){
        if(/^https?:\/\//i.test(line) && meta.name){
          var key = meta.name.toLowerCase();
          if(!seen[key]){
            seen[key] = true;
            meta.url = line;
            out.push(meta);
          }
        }
        meta = null;
      }
    }
    return out;
  }

  /* User-provided embedded player pages */
  var statics = list.querySelectorAll('.ccard[data-embed]');
  function playEmbed(name, url){
    clearPlayer();
    if(home.className.indexOf('hidden') < 0) lastY = window.pageYOffset || 0;
    document.getElementById('wtitle').textContent = name;
    home.className = 'hidden';
    watch.className = '';
    window.scrollTo(0,0);
    ph.className = 'ph hidden';
    var frame = document.createElement('iframe');
    frame.src = url;
    frame.title = name;
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    frame.setAttribute('allowfullscreen', 'allowfullscreen');
    frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    frame.setAttribute('loading', 'eager');
    frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:#000';
    player.appendChild(frame);
  }
  for(var q = 0; q < statics.length; q++){
    (function(card){
      card.onclick = function(){ playEmbed(card.getAttribute('data-name'), card.getAttribute('data-embed')); };
    })(statics[q]);
  }
  document.getElementById('watchBtn').onclick = function(){
    playEmbed('Sony Sports Live', 'https://allrounder3-0.pages.dev/cricket/sony-3');
  };

  /* Other Channels: try the hosted playlist, then GitHub's raw source. */
  var PLAYLISTS = [
    'https://iptv-org.github.io/iptv/countries/in.m3u',
    'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/in.m3u'
  ];
  function loadPlaylist(index){
    if(index >= PLAYLISTS.length){
      status.className = 'status';
      status.textContent = 'Online channel list load nahi hui. Neeche diye gaye channels available hain; page ko HTTPS hosting par deploy karke dobara try karein.';
      return;
    }
    fetch(PLAYLISTS[index], {cache:'no-store'}).then(function(response){
      if(!response.ok) throw new Error('Playlist HTTP ' + response.status);
      return response.text();
    }).then(function(text){
      var parsed = parse(text);
      if(!parsed.length) throw new Error('No valid channel entries');
      CH = parsed;
      FILTERED_CH = CH.slice();
      status.className = 'hidden';
      renderMore();
    }).catch(function(){ loadPlaylist(index + 1); });
  }
  loadPlaylist(0);
  moreBtn.onclick = renderMore;
  document.getElementById('channelSearch').addEventListener('input', filterChannels);

  document.getElementById('backBtn').onclick = backHome;
  document.getElementById('fsBtn').onclick = function(){
    var rf = player.requestFullscreen || player.webkitRequestFullscreen;
    if(rf) rf.call(player);
  };
})();
//]]>
