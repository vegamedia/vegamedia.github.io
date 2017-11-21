/*!
 * Nhac Web Karaoke code for JW7 v1.0.0 support BigData
 * Copyright 2017 Nhac.vn, Vega Corp
 * Dev by Tan Vu ™
 * http://nhac.vn - 2017-09-19
 */

function GoPerformance(player, config, div) {
  // player - an instance of the player's public api
  // config - plugin options, searching the player config for an attribute matching the plugin name
  // div - an element where you can put your content
  
  //var playerContainer;
  var host = "nhac.vn";
  //var hosttv = "vt.nhac.vn";
  var embedSite = "?embed=1";
  var onsite;
  var referrer;
  var domainReferrer;
  var hostmode = false;
  var mode = '';
  
  var clientStrings = [
      {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
      {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
      {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
      {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
      {s:'Windows Vista', r:/Windows NT 6.0/},
      {s:'Windows Server 2003', r:/Windows NT 5.2/},
      {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
      {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
      {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
      {s:'Windows 98', r:/(Windows 98|Win98)/},
      {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
      {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
      {s:'Windows CE', r:/Windows CE/},
      {s:'Windows 3.11', r:/Win16/},
      {s:'Android', r:/Android/},
      {s:'Open BSD', r:/OpenBSD/},
      {s:'Sun OS', r:/SunOS/},
      {s:'Linux', r:/(Linux|X11)/},
      {s:'iOS', r:/(iPhone|iPad|iPod)/},
      {s:'Mac OS X', r:/Mac OS X/},
      {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
      {s:'QNX', r:/QNX/},
      {s:'UNIX', r:/UNIX/},
      {s:'BeOS', r:/BeOS/},
      {s:'OS/2', r:/OS\/2/},
      {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
  ];
  var embed = 0;     //1: Nhúng ngược lại 0
  var duration_time = -1;
  var user_agent = navigator.userAgent;
  var os = 'unknown';
  var osVersion = 'unknown';  //var os_version;
  var browser;
  var browser_version;
  var datas = {};
  
  var level = 0;
  var firstFrame = false;
  var levelsChanging = false;
  
  var perform;
  //var performance = 0;
  var du = 60;
  var player_states = {};
  var events = {};
  //var profiles = [];
  var profiles_time = {};
  //var error = 0;
  //var idle = 0;
  var buffer = 0;
  var playing = 0;
  var paused = 0;
  var startProfileTime;
  var startTime = new Date();
  var nowTime;
  var seek = 0;
  var pause = 0;
  var play = 0;
  var user_change_profile = 0;
  var auto_change_profile = 0;
  var change_caption = 0;
  var profile;

  function onReady(evt) {
    //playerContainer = player.getContainer();
    //console.log(":::::", playerContainer, config.showVIP);
    if (config.perform_debug) {
      console.log("onReady::::::::", config, player.getConfig());
    }
    //startTime = new Date();
    //events.play = 0;
    player_states.error = 0;    //= error;
    
    if (config.duration > 0) {
      du = config.duration;
    }
    
    perform = setInterval(callPerformance, du*1000);
    
    CheckHost();
  };
  
  /*function onBeforePlay(evt) {
  //console.log("|1) onBeforePlay", evt);
  //console.log("|1) onBeforePlay player:::::::::::::::::::::::::::::::::::::::::", player);
  //console.log("|1) onBeforePlay getConfig::::::::::::::::::::::::::::::::::::::", player.getConfig());
  }*/
  
  function onMeta(evt) {
    //console.log("onMeta", evt);
    nowTime = new Date();
    if (config.perform_debug) {
      console.log("onMeta:::::::::duration", evt.duration, evt.type, evt.width, evt.height, player.getState(), startTime.getTime(), nowTime.getTime(), nowTime-startTime);
    }
    
    //player_states.idle = (nowTime-startTime)/1000;
    //startTime = new Date();
    //console.log(player_states);
  }
  
  player.onReady(onReady);
  //player.onBeforePlay(onBeforePlay);
  player.on('meta', onMeta);

  player.on('firstFrame', function(evt){
    nowTime = new Date();
    if (config.perform_debug) {
      console.log("onFirstFrame:::loadTime/type", evt.loadTime, evt.type, player.getState(), startTime.getTime(), nowTime.getTime(), nowTime-startTime);
    }
    buffer += (nowTime-startTime)/1000;
    startTime = new Date();
    //console.log(" - firstFrame is", firstFrame, buffer);
    firstFrame = true;
  });
  
  /*player.on('bufferChange', function(evt){
    //console.log("bufferChange", evt);
  });*/

  player.on('buffer', function(evt){
    nowTime = new Date();
    if (config.perform_debug) {
      console.log("onBuffer:::::::oldstate", evt.oldstate, startTime.getTime(), nowTime.getTime(), nowTime-startTime);
    }
    if (evt.oldstate == 'idle') {
      player_states.idle = Math.round((nowTime-startTime)/1000);
    }
    startTime = new Date();
  });
  
  player.on('pause', function(evt){
    //console.log("onPaused", levelsChanging, evt);
    if (levelsChanging) {
      levelsChanging = false;
      player.play(true);
    } else {
      nowTime = new Date();
      if (config.perform_debug) {
        console.log("onPaused:::::::oldstate", evt.oldstate, startTime.getTime(), nowTime.getTime(), nowTime-startTime);
      }
      if (evt.oldstate == 'playing') {
        playing += (nowTime-startTime)/1000;
        player_states.playing = Math.round(playing);
        //console.log(" - playing is", playing);
      }
      startTime = new Date();
      events.pause = ++pause;
    }
  });
  
  player.on('play', function(evt){
    nowTime = new Date();
    if (config.perform_debug) {
      console.log("onPlay:::::::::oldstate", evt.oldstate, player.getState(), startTime.getTime(), nowTime.getTime(), nowTime-startTime);
    }
    if (evt.oldstate == 'buffering') {
      buffer += (nowTime-startTime)/1000;
      player_states.buffer = Math.round(buffer);
      //console.log(" - buffer is", buffer);
    } else if (evt.oldstate == 'paused') {
      paused += (nowTime-startTime)/1000;
      player_states.pause = Math.round(paused);
      //console.log(" - pause is", paused);
    }
    startTime = new Date();
    events.play = ++play;
  });
  
  /*player.on('time', function(evt){
    setLive();
  });*/
  
  player.on('playlistItem', function(evt){
    if (config.perform_debug) {
      console.log("playlistItem:::::::::evt", evt, evt.item, evt.item.mediaid, config.content_id, config.content_type);
      console.log("playlistItem:::::::::perform", perform, firstFrame, config.content_id, evt.item.mediaid);
    }
    if (config.content_id === undefined || config.content_type === "album") {
      config.content_id = evt.item.mediaid;
    }
    if (perform != undefined && firstFrame) {
      clearInterval(perform);
      clearPerformance();
      perform = setInterval(callPerformance, du*1000);
    }
  });
  
  player.on('seek', function(evt){
    if (config.perform_debug) {
      console.log("onSeek:::::::::evt", evt, seek);
    }
    events.seek = ++seek;
  });
  
  player.on('levels', function(evt){
    var levels = evt.levels;
    var isMp3 = false;
    if (config.perform_debug) {
      console.log("levels:::::::::", level, evt.currentQuality, evt, levels);
    }
    for (var i=0; i < levels.length; i++) {
      var label = levels[i].label;
      if (label.toLowerCase().indexOf('k') > 0) {
        isMp3 = true;
      }
      if (label != 'Auto') {
        label = label.replace("p", "");
        label = label.replace("k", "");
        label = label.replace("K", "");
        //profiles.push(label);
        profiles_time[label] = 0;
      }
      //console.log("level:", i, label, levels[i]);
    }
    //profiles.reverse();   //profiles.sort();
    //console.log("levels:::::::::profiles_time:", level, profiles_time, evt.currentQuality);    //, profiles
    level = evt.currentQuality;
    //console.log("visualQuality:::::::::profiles_time", isMp3, profile, evt, evt.level, player.getPosition());
    if (profile == undefined || player.getPosition() == 0) {
      startProfileTime = new Date();
    }
    /*else {
      nowTime = new Date();
      //console.log("visualQuality:::::::::startProfileTime", profile, startProfileTime.getTime(), nowTime.getTime(), nowTime-startProfileTime);
      profiles_time[profile] += (nowTime-startProfileTime)/1000;
      startProfileTime = new Date();
    }*/
    //console.log("getQualityLevels:", player.getQualityLevels(), levels);
    //console.log("evt.currentQuality:", evt.currentQuality, player.getCurrentQuality());
    profile = levels[evt.currentQuality].label;
    profile = profile.replace("p", "");
    profile = profile.replace("k", "");
    profile = profile.replace("K", "");
    //console.log(profile);
  });
  
  player.on('visualQuality', function(evt){
    if (config.perform_debug) {
      console.log("visualQuality::evt", evt, auto_change_profile);
      //console.log("visualQuality::evt", evt, auto_change_profile, evt.level, player.getVisualQuality());
      //console.log("visualQuality:::::::::evt", profile, evt.level, evt.level.index, player.getCurrentQuality(), player.getQualityLevels()[evt.level.index], player.getPosition());
    }
    events.auto_change_profile = ++auto_change_profile;
    
    //console.log("visualQuality:::::::::profiles_time", profile, evt.level.index, player.getPosition());
    if (profile == undefined || player.getPosition() == 0) {
      startProfileTime = new Date();
    } else {
      nowTime = new Date();
      //console.log("visualQuality:::::::::startProfileTime", profile, startProfileTime.getTime(), nowTime.getTime(), nowTime-startProfileTime);
      profiles_time[profile] += Math.round((nowTime-startProfileTime)/1000);
      startProfileTime = new Date();
    }
    profile = player.getQualityLevels()[evt.level.index].label;   //console.log(profile);
    profile = profile.replace("p", "");
    profile = profile.replace("k", "");
    profile = profile.replace("K", "");
    //profiles.push(profile);
    //console.log('visualQuality profiles_time', profile, profiles_time);
  });
  
  player.on('levelsChanged', function(evt){
    var levels = evt.levels;
    var label = levels[0].label;
    //console.log("levelsChanged::", level, evt.currentQuality > 0, evt.currentQuality, evt.currentQuality < level, " - ", firstFrame, levelsChanging);
    if ((label == 'Auto' || label == 'Tự động') && firstFrame && ((evt.currentQuality > 0 && evt.currentQuality < level) || level == 0)) {
      levelsChanging = true;
      player.pause(true);
    }
    
    if (config.perform_debug) {
      console.log("levelsChanged:::::::::evt", evt, user_change_profile, levelsChanging, evt.currentQuality, levels.length);
    }
    events.user_change_profile = ++user_change_profile;
    
    //console.log('levelsChanged', profile, level, player.getCurrentQuality(), evt.currentQuality, player.getPosition(), nowTime-startProfileTime);
    if (profile != undefined) {
      nowTime = new Date();
      profiles_time[profile] += Math.round((nowTime-startProfileTime)/1000);
      startProfileTime = new Date();
    }
    
    if (evt.currentQuality >= levels.length) return;
    profile = levels[evt.currentQuality].label;
    if (profile != 'Auto') {
      profile = profile.replace("p", "");
      profile = profile.replace("k", "");
      profile = profile.replace("K", "");
      //profiles.push(profile);
    }
    //console.log('levelsChanged profiles_time', level, profile, profiles_time);
    level = evt.currentQuality;
  });
  
  player.on('captionsChanged', function(evt){
    if (config.perform_debug) {
      console.log("captionsChanged:::::::::evt", evt, change_caption, player.getPosition());
    }
    if (player.getPosition() > 0)
      events.change_caption = ++change_caption;
  });
  
  player.on('complete', function(evt){
    if (config.perform_debug) {
      console.log("complete", typeof nextUp, perform, config.content_type);
    }
    if (perform != undefined)clearInterval(perform);
  });
  
  function callPerformance() {
    //console.log("performance2", performance, config.duration, performance*config.duration, evt.position > performance*config.duration, evt.position, evt);
    if (config.performance && typeof Performance !== 'undefined' && typeof Performance === 'function') {
    //&& evt.position > performance + config.duration) {
        //performance += config.duration;
        nowTime = new Date();
        console.log("performance", player.getState(), events.play, play, startTime.getTime(), nowTime.getTime(), nowTime-startTime);
        if (player.getState() == 'playing') {
          playing += (nowTime-startTime)/1000;
          player_states.playing = Math.round(playing);
          //console.log(" - playing is", playing, play);
          //console.log(" - pause is", playing, pause, paused);
          if (play == 0)events.play = ++play;
          if (pause == 0 && paused > 0)events.pause = ++pause;
        } else if (player.getState() == 'paused') {
          paused += (nowTime-startTime)/1000;
          player_states.pause = Math.round(paused);
          //console.log(" - playing is", playing, play, playing);
          if (pause == 0)events.pause = ++pause;
          if (play == 0 && playing > 0)events.play = ++play;
        } else if (player.getState() == 'buffering') {
          buffer += (nowTime-startTime)/1000;
          player_states.buffer = Math.round(buffer);
          if (play == 0)events.play = play;
        }
        
        //console.log('profiles_time????????????', profile, nowTime-startProfileTime);
        /*if (profiles.length == 0) {
          //profiles.push(profile);
        }*/
        nowTime = new Date();
        profiles_time[profile] += Math.round((nowTime-startProfileTime)/1000);
        startProfileTime = new Date();
        //console.log('profiles_time????????????', profile, profiles_time, nowTime-startProfileTime);
        
        Performance();
        clearPerformance();
    }
  }
  
  function clearPerformance() {
    startTime = new Date();
    buffer = 0;
    playing = 0;
    paused = 0;
    player_states = {
      error: 0,
      idle: 0,
      buffer: 0,
      playing: 0,
      pause: 0
    };
    seek = 0;
    pause = 0;
    play = 0;
    user_change_profile = 0;
    auto_change_profile = 0;
    change_caption = 0;
    events = {
      seek: 0,
      pause: 0,
      play: 0,
      user_change_profile: 0,
      auto_change_profile: 0,
      change_caption: 0
    };
    
    //profiles = [];
    for (var prof in profiles_time) {
      //console.log('profile.' + prof, '=', profiles_time[prof]);
      profiles_time[prof] = 0;
    }
    //console.log('profiles_time############', profile, profiles_time);
  }
  
  this.resize = function(width, height) {
    // do anything? nahh
    //console.log("resize", width, height);
  };
  
  /******************************************/
  /*       The Performance Function         */
  /******************************************/
  function checkPerformance() {
    //console.log("checkPerformance::", hostmode,  mode, config.modepro);
    if (!hostmode) {
      embed = 1;
    }
    
    // system
    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(user_agent)) {
            os = cs.s;
            break;
        }
    }
    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        os = 'Windows';
    }
    switch (os) {
        case 'Mac OS X':
            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(user_agent)[1];
            break;
        case 'Android':
            osVersion = /Android ([\.\_\d]+)/.exec(user_agent)[1];
            break;
        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            break;
    }
    
    var tem,
        M= user_agent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
      tem=  /\brv[ :]+(\d+)/g.exec(user_agent) || [];
      return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
      tem= user_agent.match(/\b(OPR|Edge)\/(\d+)/);
      if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= user_agent.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    browser = M[0].toLowerCase();
    browser_version = M[1];
    //console.log("Performance::user_agent", navigator, navigator.userAgent, M, user_agent, browser_version, tem);
  }

  //Performance(player, player_states, events, profiles_time);
  //player, player_states, events, profile
  function Performance() {
    if (config.perform_debug) {
      console.log("Performance::", config, browser, typeof player.duration, typeof player.getDuration, player.getDuration());
    }
    if (browser == undefined || duration_time < 0) {
      if (typeof player.duration === "function" && player.duration() > 0) {
        duration_time = Math.round(player.duration());
      } else if (typeof player.getDuration === "function" && player.getDuration() > 0) {
        duration_time = Math.round(player.getDuration());
      }
      checkPerformance();
    }
    Number.prototype.padLeft = function(base,chr){
      var  len = (String(base || 10).length - String(this).length)+1;
      return len > 0? new Array(len).join(chr || '0')+this : this;
    }
    var dateTime = new Date();
    var dformat = [dateTime.getFullYear(),
                  (dateTime.getMonth()+1).padLeft(),
                   dateTime.getDate().padLeft()].join('-')+' '+
                  [dateTime.getHours().padLeft(),
                   dateTime.getMinutes().padLeft(),
                   dateTime.getSeconds().padLeft()].join(':');
    var unix = Math.round(dateTime.getTime()/1000);   //var milliseconds = Math.round(+new Date()/1000);
    var position = -1;
    
    if (typeof player.currentTime === "function") {
      position = Math.round(player.currentTime());
    } else if (typeof player.getPosition === "function") {
      position = Math.round(player.getPosition());
    }
    
    datas.ctime = unix;
    datas.du = du;
    datas.uid = config.user_id;
    datas.vid = config.vega_id;
    datas.msi = config.msisdn;
    datas.pid = config.package_id;
    datas.cid = config.content_id;
    datas.aid = config.album_id;
    datas.ctype = config.content_type;
    datas.uso = config.utm_source;
    datas.ume = config.utm_medium;
    datas.ute = config.utm_term;
    datas.uco = config.utm_content;
    datas.uca = config.utm_campaign;
    datas.em = embed;
    datas.pst = player_states;       //player_states.toString()
    datas.event = events;
    datas.pro = profiles_time;
    datas.pos = position;
    datas.dti = duration_time;
    datas.os = os.toLowerCase();     //os = navigator.platform
    datas.osv = osVersion;           //os_version
    datas.br = browser;
    datas.brv = browser_version;
    datas.did = config.device_id;
    datas.c = config.channel;
    datas.s = config.session_id;
    datas.ua = user_agent;
    datas.url = onsite;
    datas.ref = config.url_referer;    //referrer.href
    datas.act = config.action_type;
    datas.ptype = config.player_type;
    datas.sid = config.service_id;
    datas.sr = config.source_rec;
    datas.lst = "online";   //config.listen_state;
    datas.o = config.other_info;
    datas.etime = config.expired_time;
    datas.cstr = dformat;
    datas.v = config.version;

    var encoded = btoa(JSON.stringify(datas));

    if (config.perform_debug) {
      console.log("player_states:::", player_states);
      console.log("events::::::::::", events);
      console.log("profiles_time:::", profiles_time);
      console.log("datas:::::::::::", datas);
      //console.log("dformat:::::::::", dformat);
      //console.log("encoded", encoded);
      //console.log("atob(encoded)", atob(encoded));
    }
    console.log("profiles_time", profiles_time);
    //console.log("datas", datas);

    var theUrl = "https://collect.ovp.vn/nhac_collect?data=" + encoded;
    //console.log("window.jQuery", window.jQuery);
    if(window.jQuery) {
      $.get(theUrl, function(data, status){
        //console.log("Data: " + data + "\nStatus: " + status);
      });
    } else {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
      xmlHttp.send( null );
      //console.log("xmlHttp.responseText", xmlHttp.responseText);
    }
  }

  /******************************************/
  /*        The CheckHost Function         */
  /******************************************/
  function CheckHost() {
    if (config.perform_debug) {
      //console.log("CheckHost::", config, config.mode2, config.mode2 != undefined, config.mode == undefined);
      console.log("CheckHost::", onsite, referrer, domainReferrer, hostmode, mode);
    }
    //Check host: onSite or embed
    //window.location!=window.parent.location?document.referrer:document.location
    onsite = document.URL;
    referrer = (window.location != window.parent.location) ? window.parent.location : document.location;
    if (referrer == "undefined") {
        referrer = onsite;
        //is_iniframe = false;
    }
    domainReferrer = referrer.hostname;
    //referrer.href.indexOf(host)>0              || domainReferrer.indexOf(hosttv) >= 0
    if (domainReferrer.indexOf(host) >= 0) {
        hostmode = true;  //mode = 'onsite';
        if (config != undefined && config.mode != undefined) {
          mode = config.mode;
        }
    } else {
        hostmode = false;
        if (domainReferrer.indexOf(embedSite) > 0) {
            mode = 'iframe';
        } else {
            mode = 'embed';
        }
    }
    config.modepro = config.modepro = mode;
    if (config.perform_debug) {
      console.log("CheckHost::onsite", onsite, "referrer:", referrer, "domainReferrer:", domainReferrer, "hostmode:", hostmode, "mode:", mode, "config.mode:", config.mode, "config.modepro:", config.modepro);
    }
  }
};