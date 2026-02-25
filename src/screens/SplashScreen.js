import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, F } from '../utils/theme';

const { width: W, height: H } = Dimensions.get('window');

const LINES = [
  '> Initializing CBTI Foundry Systems...',
  '> Loading curriculum modules [9]...',
  '> Verifying Govt. Registration [WB]...',
  '> Connecting to Batch Network...',
  '> Calibrating knowledge matrix...',
  '> All systems nominal. Welcome.',
];

export default function SplashScreen({ onFinish }) {
  const [lines, setLines]   = useState([]);
  const [pct, setPct]       = useState(0);
  const [ready, setReady]   = useState(false);

  // Animated values — all native driver compatible
  const uiOpacity   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.84)).current;
  const progressW   = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.06)).current;
  const enterScale  = useRef(new Animated.Value(0.9)).current;
  const enterOpacity= useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale   = useRef(new Animated.Value(1)).current;
  const cursorAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ghost logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 30, useNativeDriver: true }),
    ]).start();

    // UI panel entrance
    setTimeout(() => {
      Animated.timing(uiOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, 400);

    // Glow pulse loop
    Animated.loop(Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 0.18, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.06, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    // Cursor blink
    Animated.loop(Animated.sequence([
      Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])).start();

    // Terminal typing sequence
    let idx = 0;
    const tick = () => {
      if (idx < LINES.length) {
        const line = LINES[idx];
        idx++;
        setLines(prev => [...prev, line]);
        const p = Math.round((idx / LINES.length) * 100);
        setPct(p);
        Animated.timing(progressW, {
          toValue: idx / LINES.length,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
        setTimeout(tick, 520 + Math.random() * 180);
      } else {
        setTimeout(() => {
          setReady(true);
          Animated.parallel([
            Animated.spring(enterScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
            Animated.timing(enterOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          ]).start();
        }, 400);
      }
    };
    setTimeout(tick, 700);
  }, []);

  const handleEnter = () => {
    Animated.parallel([
      Animated.timing(exitOpacity, { toValue: 0, duration: 550, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(exitScale, { toValue: 1.06, duration: 550, useNativeDriver: true }),
    ]).start(() => onFinish());
  };

  const barWidth = progressW.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  return (
    <Animated.View style={[s.root, { opacity: exitOpacity, transform:[{scale:exitScale}] }]}>

      {/* Vignette */}
      <LinearGradient
        colors={['transparent','rgba(8,6,4,0.65)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Glow blob */}
      <Animated.View style={[s.glow, { opacity: glowOpacity }]} pointerEvents="none" />

      {/* Background ghost CBTI mark */}
      <Animated.View style={[s.bgBrand, { opacity: logoOpacity, transform:[{scale:logoScale}] }]} pointerEvents="none">
        <Text style={s.bgLogo}>CBTI</Text>
        <Text style={s.bgLogoSub}>THE FOUNDRY FOR MINDS</Text>
      </Animated.View>

      {/* Main UI */}
      <Animated.View style={[s.panel, { opacity: uiOpacity }]}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.logoTxt}>CBTI</Text>
          <Text style={s.logoSub}>FOUNDRY FOR MINDS · KORAR BAGAN, BONGAON</Text>
        </View>

        {/* Terminal window */}
        <View style={s.terminal}>
          <View style={s.termBar}>
            <View style={[s.termDot,{backgroundColor:'#a04535'}]}/>
            <View style={[s.termDot,{backgroundColor:'#c4883a'}]}/>
            <View style={[s.termDot,{backgroundColor:'#4a8c5c'}]}/>
            <Text style={s.termTitle}>system.init</Text>
          </View>
          <View style={s.termBody}>
            {lines.map((ln, i) => (
              <Text key={i} style={[s.termLine, i < lines.length-1 && s.termLineDone]}>
                {ln}
                {i === lines.length-1 && (
                  <Animated.Text style={[s.cursor,{opacity:cursorAnim}]}> █</Animated.Text>
                )}
              </Text>
            ))}
          </View>
        </View>

        {/* Progress */}
        <View style={s.progWrap}>
          <View style={s.progTrack}>
            <Animated.View style={[s.progFill, { width: barWidth }]}>
              <LinearGradient
                colors={[C.accent, C.accent2]}
                start={{x:0,y:0}} end={{x:1,y:0}}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <View style={s.progFooter}>
            <Text style={s.progPct}>{pct}%</Text>
            <Text style={s.progLabel}>{ready ? 'SYSTEM READY' : 'INITIALIZING...'}</Text>
          </View>
        </View>

        {/* Enter button */}
        {ready && (
          <Animated.View style={{ opacity: enterOpacity, transform:[{scale:enterScale}] }}>
            <TouchableOpacity onPress={handleEnter} activeOpacity={0.85} style={s.enterBtn}>
              <LinearGradient
                colors={[C.accent,'#7a5025']}
                start={{x:0,y:0}} end={{x:1,y:1}}
                style={s.enterGrad}
              >
                <Text style={s.enterTxt}>ENTER THE FOUNDRY</Text>
                <Text style={s.enterArrow}> →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={s.enterHint}>Tap to unlock your institute dashboard</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Status bar */}
      <View style={s.statusBar}>
        <View style={s.statusDot}/>
        <Text style={s.statusTxt}>{ready ? 'SYSTEM OPERATIONAL' : 'LOADING SYSTEMS'}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:1, backgroundColor:C.dark,
    alignItems:'center', justifyContent:'center',
  },
  glow: {
    position:'absolute',
    width:300, height:300, borderRadius:150,
    backgroundColor:'rgba(156,106,48,0.25)',
    top: H*0.28, alignSelf:'center',
  },
  bgBrand: {
    position:'absolute',
    top:'50%', left:0, right:0,
    alignItems:'center',
    transform:[{translateY:-90}],
  },
  bgLogo: {
    fontFamily: F.display,
    fontSize: Math.min(W*0.44, 168),
    color:'rgba(212,196,160,0.13)',
    letterSpacing:-5,
    lineHeight: Math.min(W*0.44, 168)*1,
  },
  bgLogoSub: {
    fontFamily: F.mono,
    fontSize:8.5, letterSpacing:4,
    color:'rgba(107,94,72,0.45)',
    textTransform:'uppercase', marginTop:4, textAlign:'center',
  },

  panel: { width: Math.min(W-40, 420), zIndex:2 },

  header: { alignItems:'center', marginBottom:24 },
  logoTxt: {
    fontFamily:F.display, fontSize:44,
    color:C.darkText, letterSpacing:-1.5, lineHeight:48,
  },
  logoSub: {
    fontFamily:F.mono, fontSize:8.5,
    color:C.darkMuted, letterSpacing:3,
    textTransform:'uppercase', marginTop:5, textAlign:'center',
  },

  terminal: {
    borderWidth:1, borderColor:'rgba(212,196,160,0.10)',
    backgroundColor:'rgba(255,248,235,0.025)',
    borderRadius:4, overflow:'hidden', marginBottom:14,
  },
  termBar: {
    flexDirection:'row', alignItems:'center', gap:5,
    paddingHorizontal:12, paddingVertical:8,
    borderBottomWidth:1, borderBottomColor:'rgba(212,196,160,0.07)',
    backgroundColor:'rgba(255,255,255,0.015)',
  },
  termDot: { width:8, height:8, borderRadius:4, opacity:0.75 },
  termTitle: {
    fontFamily:F.mono, fontSize:9, color:C.darkFaint,
    letterSpacing:2, marginLeft:6,
  },
  termBody: { padding:14, minHeight:118 },
  termLine: {
    fontFamily:F.mono, fontSize:11.5,
    color:'#8db4c8', marginBottom:5, lineHeight:18,
  },
  termLineDone: { color:'rgba(74,62,46,0.85)' },
  cursor: { color:C.accent },

  progWrap: { marginBottom:22 },
  progTrack: {
    height:2, backgroundColor:'rgba(212,196,160,0.09)',
    borderRadius:1, overflow:'hidden',
  },
  progFill: { height:'100%', borderRadius:1 },
  progFooter: {
    flexDirection:'row', justifyContent:'space-between',
    alignItems:'center', marginTop:6,
  },
  progPct: { fontFamily:F.mono, fontSize:10, color:C.darkFaint, letterSpacing:1 },
  progLabel: { fontFamily:F.mono, fontSize:9, color:C.darkFaint, letterSpacing:2, textTransform:'uppercase' },

  enterBtn: { borderRadius:3, overflow:'hidden', marginBottom:10 },
  enterGrad: {
    flexDirection:'row', alignItems:'center', justifyContent:'center',
    paddingVertical:16, paddingHorizontal:24,
  },
  enterTxt: {
    fontFamily:F.display, fontSize:13, color:'#f5edd8',
    letterSpacing:2.5, textTransform:'uppercase',
  },
  enterArrow: { fontFamily:F.mono, fontSize:17, color:'#f5edd8' },
  enterHint: {
    fontFamily:F.mono, fontSize:9, color:C.darkFaint,
    letterSpacing:1.5, textTransform:'uppercase',
    textAlign:'center',
  },

  statusBar: {
    position:'absolute', bottom:28,
    flexDirection:'row', alignItems:'center', gap:8,
  },
  statusDot: {
    width:5, height:5, borderRadius:2.5,
    backgroundColor:'#4a8c5c',
    shadowColor:'#4a8c5c', shadowOpacity:0.9, shadowRadius:5, elevation:3,
  },
  statusTxt: {
    fontFamily:F.mono, fontSize:9, color:C.darkFaint,
    letterSpacing:2.5, textTransform:'uppercase',
  },
});
