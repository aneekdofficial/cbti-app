import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated,
  TouchableOpacity, TextInput, FlatList,
  Easing, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, W, H, COURSES, STAGES, EMAILJS } from '../utils/theme';

// ─── helpers ───────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function useReveal(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty      = useRef(new Animated.Value(38)).current;
  const run = () => Animated.parallel([
    Animated.timing(opacity, { toValue:1, duration:700, delay, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
    Animated.timing(ty,      { toValue:0, duration:700, delay, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
  ]).start();
  return { opacity, ty, run };
}

function Reveal({ delay=0, children, style }) {
  const a = useReveal(delay);
  useEffect(() => { a.run(); }, []);
  return (
    <Animated.View style={[style, { opacity:a.opacity, transform:[{translateY:a.ty}] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Chapter label (matches website .chapter-label) ────────────────────────
function ChapterLabel({ text, color }) {
  return (
    <View style={[lbl.wrap, color && { borderColor: color }]}>
      <View style={[lbl.line, color && { backgroundColor: color }]}/>
      <Text style={[lbl.txt, color && { color }]}>{text.toUpperCase()}</Text>
    </View>
  );
}
const lbl = StyleSheet.create({
  wrap: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:14 },
  line: { width:28, height:1, backgroundColor:C.accent },
  txt:  { fontFamily:F.mono, fontSize:9, color:C.accent, letterSpacing:2.8 },
});

// ─── Divider ───────────────────────────────────────────────────────────────
function Divider() {
  return (
    <LinearGradient
      colors={['transparent', C.faint, 'transparent']}
      start={{x:0,y:0}} end={{x:1,y:0}}
      style={{ height:1, marginVertical:2 }}
    />
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────────
function Nav({ navScrolled, insets, navigation, onHome, onPath, onCurriculum, onContact }) {
  const handlers = { HOME:onHome, PATH:onPath, CURRICULUM:onCurriculum, CONTACT:onContact };
  return (
    <View style={[nav.bar, navScrolled && nav.scrolled, { paddingTop: insets.top + 6 }]}>
      <Text style={nav.brand}>CBTI</Text>
      <View style={nav.sep}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex:1}}>
        <View style={nav.links}>
          {['HOME','PATH','CURRICULUM','CONTACT'].map(l => (
            <TouchableOpacity key={l} onPress={handlers[l]}>
              <Text style={nav.link}>{l}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('Vault')}>
            <View style={nav.vault}><Text style={nav.vaultTxt}>⬡ VAULT</Text></View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
const nav = StyleSheet.create({
  bar: {
    position:'absolute', top:0, left:0, right:0, zIndex:200,
    flexDirection:'row', alignItems:'center',
    paddingHorizontal:16, paddingBottom:10,
    backgroundColor:'rgba(240,232,213,0.78)',
  },
  scrolled: {
    backgroundColor:'rgba(240,232,213,0.96)',
    borderBottomWidth:1, borderBottomColor:'rgba(156,106,48,0.15)',
    shadowColor:'#64461e', shadowOpacity:0.08, shadowRadius:12, elevation:4,
  },
  brand: { fontFamily:F.display, fontSize:18, color:C.accent, letterSpacing:-0.5 },
  sep:   { width:1, height:14, backgroundColor:C.border, marginHorizontal:10 },
  links: { flexDirection:'row', alignItems:'center', gap:14 },
  link:  { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:1.5 },
  vault: { paddingHorizontal:10, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:'rgba(61,112,128,0.28)', backgroundColor:'rgba(61,112,128,0.06)' },
  vaultTxt: { fontFamily:F.mono, fontSize:9, color:C.accent2, letterSpacing:1 },
});

// ─── HERO ──────────────────────────────────────────────────────────────────
function Hero({ onCurriculum, onContact }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue:-5, duration:3200, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
      Animated.timing(floatY, { toValue:0, duration:3200, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(scrollY, { toValue:0.85, duration:2000, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
      Animated.timing(scrollY, { toValue:0.35, duration:2000, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
    ])).start();
  }, []);

  return (
    <View style={hero.wrap}>
      <LinearGradient
        colors={[C.bg, 'rgba(240,232,213,0.5)', C.bg]}
        style={StyleSheet.absoluteFill} pointerEvents="none"
      />
      <Reveal delay={0}>
        <Text style={hero.eyebrow}>Exhibit 000 · The Beginning</Text>
      </Reveal>
      <Reveal delay={200}>
        <View style={hero.titleBlock}>
          <Text style={hero.titleMuted}>THE</Text>
          <Animated.Text style={[hero.titleAccent, {transform:[{translateY:floatY}]}]}>
            FOUNDRY
          </Animated.Text>
          <Text style={hero.titleMuted}>FOR</Text>
          <Text style={hero.titleDark}>MINDS.</Text>
        </View>
      </Reveal>
      <Reveal delay={460}>
        <Text style={hero.desc}>
          CBTI [Govt. Regd.] — Where raw intellect is forged into digital mastery.
          Located in the heart of Korar Bagan, Bongaon. A sanctuary for those who seek to evolve.
        </Text>
      </Reveal>
      <Reveal delay={650}>
        <View style={hero.cta}>
          <TouchableOpacity onPress={onCurriculum} activeOpacity={0.85} style={hero.btnPrimaryWrap}>
            <LinearGradient colors={[C.accent,'#7a5025']} start={{x:0,y:0}} end={{x:1,y:1}} style={hero.btnPrimary}>
              <Text style={hero.btnPrimaryTxt}>ENTER THE EXHIBITS</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onContact} activeOpacity={0.8} style={hero.btnGhost}>
            <Text style={hero.btnGhostTxt}>INITIATE CONTACT</Text>
          </TouchableOpacity>
        </View>
      </Reveal>
      <View style={hero.scrollHint}>
        <Animated.View style={[hero.scrollLine, {opacity:scrollY}]}/>
        <Text style={hero.scrollTxt}>Scroll to explore</Text>
      </View>
    </View>
  );
}

const FS_TITLE = clamp(W*0.21, 66, 92);
const hero = StyleSheet.create({
  wrap: {
    minHeight:H, alignItems:'center', justifyContent:'center',
    paddingHorizontal:28, paddingTop:110, paddingBottom:80,
  },
  eyebrow: {
    fontFamily:F.mono, fontSize:10, color:C.accent,
    letterSpacing:3, textTransform:'uppercase', textAlign:'center', marginBottom:22,
  },
  titleBlock: { alignItems:'center', marginBottom:22 },
  titleMuted: { fontFamily:F.display, fontSize:FS_TITLE*0.65, color:C.muted, letterSpacing:-2, lineHeight:FS_TITLE*0.65 },
  titleAccent: {
    fontFamily:F.display, fontSize:FS_TITLE, color:C.accent,
    letterSpacing:-3.5, lineHeight:FS_TITLE,
    textShadowColor:'rgba(156,106,48,0.22)', textShadowOffset:{width:0,height:6}, textShadowRadius:24,
  },
  titleDark: { fontFamily:F.display, fontSize:FS_TITLE, color:C.text, letterSpacing:-3.5, lineHeight:FS_TITLE },
  desc: {
    fontFamily:F.mono, fontSize:12.5, color:C.muted,
    lineHeight:23, textAlign:'center', maxWidth:360, marginBottom:34,
  },
  cta: { flexDirection:'row', flexWrap:'wrap', gap:12, justifyContent:'center' },
  btnPrimaryWrap: { borderRadius:3, overflow:'hidden' },
  btnPrimary:     { paddingVertical:14, paddingHorizontal:28 },
  btnPrimaryTxt:  { fontFamily:F.display, fontSize:12, color:'#f5edd8', letterSpacing:1.8 },
  btnGhost: {
    paddingVertical:14, paddingHorizontal:28,
    borderWidth:1, borderColor:C.border, borderRadius:3,
  },
  btnGhostTxt: { fontFamily:F.mono, fontSize:11.5, color:C.text2, letterSpacing:1.5 },
  scrollHint: { position:'absolute', bottom:30, alignItems:'center', gap:6 },
  scrollLine: { width:1, height:40, backgroundColor:C.accent },
  scrollTxt:  { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:2.2, textTransform:'uppercase' },
});

// ─── STORY / ABOUT ─────────────────────────────────────────────────────────
function Story() {
  const stats = [
    {val:'8+',    label:'Disciplines'},
    {val:'100%',  label:'Practical Focus'},
    {val:'Govt.', label:'Registered'},
    {val:'∞',     label:'Potential'},
  ];
  return (
    <View style={story.section}>
      <Text style={story.bigNum}>01</Text>
      <Reveal>
        <ChapterLabel text="Chapter I · The Origin"/>
        <View style={story.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={story.statItem}>
              <Text style={story.statVal}>{s.val}</Text>
              <Text style={story.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Reveal>
      <Divider/>
      <Reveal delay={100}>
        <ChapterLabel text="The Evolution of the Digital Self"/>
        <Text style={story.h2}>
          Not a school.{'\n'}A <Text style={{color:C.accent}}>transformation</Text> engine.
        </Text>
        <Text style={story.p}>
          CBTI was not built to issue certificates. It was built to{' '}
          <Text style={story.strong}>rewire minds</Text>. In the age of algorithms and digital economies, the gap between those who understand technology and those who are controlled by it is widening.
        </Text>
        <Text style={story.p}>
          Every course offered here is a <Text style={story.strong}>chapter in a larger story</Text> — the story of your evolution from a passive consumer of technology to an active architect of it. We call this The Evolution of the Digital Self.
        </Text>
        <Text style={story.p}>
          Rooted in Korar Bagan, Bongaon, yet connected to a world that runs on code, design, and data.{' '}
          <Text style={story.strong}>Government Registered. Community Trusted. Future-Focused.</Text>
        </Text>
      </Reveal>
    </View>
  );
}
const FSTORY = clamp(W*0.092, 28, 36);
const story = StyleSheet.create({
  section: { padding:28, paddingTop:52, paddingBottom:52, position:'relative' },
  bigNum:  {
    position:'absolute', top:18, left:8,
    fontFamily:F.display, fontSize:clamp(W*0.36,100,150),
    color:C.faint, opacity:0.38, lineHeight:clamp(W*0.36,100,150),
  },
  statsGrid: { flexDirection:'row', flexWrap:'wrap', gap:20, marginBottom:28, marginTop:8, paddingLeft:4 },
  statItem:  { borderLeftWidth:2, borderLeftColor:C.accent, paddingLeft:12, width:'44%' },
  statVal:   { fontFamily:F.display, fontSize:32, color:C.accent, fontWeight:'800', lineHeight:36 },
  statLbl:   { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:1.5, textTransform:'uppercase', marginTop:3 },
  h2: { fontFamily:F.display, fontSize:FSTORY, color:C.text, letterSpacing:-1, lineHeight:FSTORY*1.12, marginBottom:18 },
  p:  { fontFamily:F.mono, fontSize:12.5, color:C.muted, lineHeight:23, marginBottom:14 },
  strong: { color:C.text2, fontFamily:F.monoBold },
});

// ─── COURSE CARD ───────────────────────────────────────────────────────────
function CourseCard({ item }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue:0.97, friction:10, useNativeDriver:true }).start();
  const onOut = () => Animated.spring(scale, { toValue:1,    friction:8,  useNativeDriver:true }).start();

  return (
    <TouchableOpacity onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
      <Animated.View style={[
        card.wrap,
        item.special && card.special,
        { transform:[{scale}] },
      ]}>
        <Text style={[card.num, item.special && {color:'rgba(61,112,128,0.12)'}]}>{item.num}</Text>
        <View style={[card.tag, item.special && card.tagSpecial]}>
          <Text style={[card.tagTxt, item.special && card.tagTxtSpecial]}>{item.tag}</Text>
        </View>
        <Text style={card.title}>{item.title}</Text>
        <Text style={card.desc}>{item.desc}</Text>
        <View style={card.meta}>
          <View>
            <Text style={card.durLbl}>Duration</Text>
            <Text style={card.durVal}>{item.duration}</Text>
          </View>
          <View style={{alignItems:'flex-end'}}>
            <Text style={[card.fee, item.special && {color:C.accent2}]}>{item.fee}</Text>
            <Text style={card.feeUnit}>{item.unit}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
const CARD_W = clamp(W*0.8, 260, 310);
const card = StyleSheet.create({
  wrap: {
    width:CARD_W, marginRight:14,
    backgroundColor:C.bg,
    borderWidth:1, borderColor:C.border,
    borderRadius:4, padding:22,
    overflow:'hidden', position:'relative',
    shadowColor:C.text, shadowOpacity:0.05, shadowRadius:8, elevation:2,
  },
  special: { backgroundColor:'rgba(61,112,128,0.04)', borderColor:'rgba(61,112,128,0.16)' },
  num:  { fontFamily:F.display, fontSize:68, color:'rgba(35,25,15,0.055)', position:'absolute', top:4, right:8, lineHeight:72 },
  tag:  { alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:'rgba(156,106,48,0.22)', marginBottom:14 },
  tagSpecial: { borderColor:'rgba(61,112,128,0.22)' },
  tagTxt: { fontFamily:F.mono, fontSize:9, color:C.accent, letterSpacing:1.5, textTransform:'uppercase' },
  tagTxtSpecial: { color:C.accent2 },
  title:   { fontFamily:F.bold, fontSize:18, color:C.text, letterSpacing:-0.4, lineHeight:25, marginBottom:10 },
  desc:    { fontFamily:F.mono, fontSize:11.5, color:C.muted, lineHeight:20, marginBottom:20 },
  meta:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', borderTopWidth:1, borderTopColor:C.border, paddingTop:14 },
  durLbl:  { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:1 },
  durVal:  { fontFamily:F.bold, fontSize:16, color:C.text2, marginTop:2 },
  fee:     { fontFamily:F.display, fontSize:24, fontWeight:'800', color:C.accent },
  feeUnit: { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:0.5 },
});

// ─── CURRICULUM SECTION ────────────────────────────────────────────────────
function Curriculum() {
  return (
    <View style={curr.section}>
      <View style={curr.hdr}>
        <ChapterLabel text="Chapter II · The Exhibits"/>
        <Text style={curr.heading}>The Curriculum</Text>
        <Text style={curr.hint}>Swipe to explore all courses →</Text>
      </View>
      <FlatList
        data={COURSES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.num}
        contentContainerStyle={curr.list}
        snapToInterval={CARD_W + 14}
        decelerationRate="fast"
        renderItem={({item}) => <CourseCard item={item}/>}
      />
    </View>
  );
}
const curr = StyleSheet.create({
  section: { paddingTop:44, paddingBottom:24, backgroundColor:C.surface },
  hdr:     { paddingHorizontal:28, marginBottom:20 },
  heading: { fontFamily:F.display, fontSize:clamp(W*0.1,32,42), color:C.text, letterSpacing:-1.5, marginBottom:5 },
  hint:    { fontFamily:F.mono, fontSize:10, color:C.muted, letterSpacing:1 },
  list:    { paddingHorizontal:28, paddingBottom:4 },
});

// ─── PATH / PROCESS ────────────────────────────────────────────────────────
function PathSection() {
  return (
    <View style={path.section}>
      <Reveal>
        <ChapterLabel text="Chapter III · The Process"/>
        <Text style={path.heading}>How the Foundry Works</Text>
        <Text style={path.sub}>A four-stage transformation protocol, designed around human potential.</Text>
      </Reveal>
      {STAGES.map((st,i) => (
        <Reveal key={st.num} delay={i*80}>
          <View style={path.step}>
            <View style={path.stepBar}/>
            <Text style={path.stepNum}>{st.num}</Text>
            <Text style={path.stepTitle}>{st.title}</Text>
            <Text style={path.stepDesc}>{st.desc}</Text>
          </View>
        </Reveal>
      ))}
    </View>
  );
}
const path = StyleSheet.create({
  section: { padding:28, paddingTop:52, paddingBottom:52 },
  heading: { fontFamily:F.display, fontSize:clamp(W*0.096,30,40), color:C.text, letterSpacing:-1.5, marginBottom:10 },
  sub:     { fontFamily:F.mono, fontSize:12, color:C.muted, lineHeight:21, marginBottom:28, maxWidth:340 },
  step:    { borderWidth:1, borderColor:C.border, borderRadius:4, padding:20, marginBottom:12, backgroundColor:C.surface, position:'relative', overflow:'hidden' },
  stepBar: { position:'absolute', left:0, top:0, bottom:0, width:3, backgroundColor:C.accent, opacity:0.55 },
  stepNum: { fontFamily:F.mono, fontSize:9, color:C.accent, letterSpacing:2, marginBottom:8, marginLeft:7 },
  stepTitle:{ fontFamily:F.bold, fontSize:22, color:C.text, letterSpacing:-0.8, marginBottom:7, marginLeft:7 },
  stepDesc: { fontFamily:F.mono, fontSize:12, color:C.muted, lineHeight:20, marginLeft:7 },
});

// ─── CONTACT FORM ──────────────────────────────────────────────────────────
function Contact() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [course,  setCourse]  = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const sentScale = useRef(new Animated.Value(0.85)).current;
  const sentOpacity = useRef(new Animated.Value(0)).current;

  const send = async () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Required', 'Please fill in your name and message.'); return;
    }
    setSending(true);
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          service_id:  EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id:     EMAILJS.publicKey,
          template_params: { from_name:name, reply_to:email, message:`Course Interest: ${course}\n\n${message}` },
        }),
      });
      setSending(false);
      if (res.status === 200) {
        setSent(true);
        Animated.parallel([
          Animated.spring(sentScale, { toValue:1, friction:6, tension:50, useNativeDriver:true }),
          Animated.timing(sentOpacity, { toValue:1, duration:400, useNativeDriver:true }),
        ]).start();
      } else { Alert.alert('Error', 'Could not send. Please call +91 9932848856.'); }
    } catch(e) {
      setSending(false);
      Alert.alert('Error', 'Network error. Please call +91 9932848856.');
    }
  };

  return (
    <View style={ct.section}>
      <Reveal><ChapterLabel text="Chapter IV · The Signal" color={C.accent2}/></Reveal>
      <Reveal delay={80}>
        <Text style={ct.heading}>Initiate{'\n'}Contact.</Text>
        <Text style={ct.sub}>The first step is always the hardest. But you've already found us — that means you're ready.</Text>
      </Reveal>
      {!sent ? (
        <Reveal delay={160}>
          <View style={ct.formHeader}>
            <Text style={ct.formHeaderTxt}>SEND A MESSAGE</Text>
            <View style={ct.formHeaderLine}/>
          </View>
          <Field label="Your Name">
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Arjun Sharma" placeholderTextColor={C.faint} style={ct.input}/>
          </Field>
          <Field label="Email Address">
            <TextInput value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={C.faint} keyboardType="email-address" autoCapitalize="none" style={ct.input}/>
          </Field>
          <Field label="Course of Interest">
            <TextInput value={course} onChangeText={setCourse} placeholder="e.g. Financial Accounting" placeholderTextColor={C.faint} style={ct.input}/>
          </Field>
          <Field label="Message">
            <TextInput value={message} onChangeText={setMessage} placeholder="Tell us about yourself and what you'd like to learn…" placeholderTextColor={C.faint} multiline numberOfLines={4} style={[ct.input, ct.textarea]}/>
          </Field>
          <TouchableOpacity onPress={send} activeOpacity={0.85} style={ct.submitBtn}>
            {sending
              ? <ActivityIndicator color={C.accent}/>
              : <Text style={ct.submitTxt}>TRANSMIT SIGNAL →</Text>
            }
          </TouchableOpacity>
        </Reveal>
      ) : (
        <Animated.View style={[ct.success, { opacity:sentOpacity, transform:[{scale:sentScale}] }]}>
          <Text style={ct.successIcon}>✓</Text>
          <Text style={ct.successTitle}>Signal Received.</Text>
          <Text style={ct.successSub}>We'll be in touch shortly. The foundry awaits you.</Text>
        </Animated.View>
      )}

      {/* Direct contact info */}
      <Reveal delay={200}>
        <View style={ct.infoGrid}>
          <InfoItem icon="📞" label="Phone" val="+91 9932848856"/>
          <InfoItem icon="📍" label="Location" val={"Korar Bagan\nBongaon, W.B."}/>
          <InfoItem icon="🏛️" label="Status" val={"Govt. Registered\nEstd. Bongaon"}/>
          <InfoItem icon="🕐" label="Hours" val={"Mon – Sat\n8:00 AM – 8:00 PM"}/>
        </View>
      </Reveal>
    </View>
  );
}
function Field({ label, children }) {
  return (
    <View style={ct.field}>
      <Text style={ct.fieldLbl}>{label}</Text>
      {children}
    </View>
  );
}
function InfoItem({ icon, label, val }) {
  return (
    <View style={ct.infoItem}>
      <Text style={ct.infoIcon}>{icon}</Text>
      <View>
        <Text style={ct.infoLbl}>{label}</Text>
        <Text style={ct.infoVal}>{val}</Text>
      </View>
    </View>
  );
}
const ct = StyleSheet.create({
  section:   { padding:28, paddingTop:52, paddingBottom:52, backgroundColor:C.surface },
  heading:   { fontFamily:F.display, fontSize:clamp(W*0.13,44,60), color:C.text, letterSpacing:-2.5, lineHeight:clamp(W*0.13,44,60)*1.06, marginBottom:14 },
  sub:       { fontFamily:F.mono, fontSize:12.5, color:C.muted, lineHeight:22, marginBottom:28, maxWidth:340 },
  formHeader:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:20 },
  formHeaderTxt: { fontFamily:F.mono, fontSize:9, color:C.accent2, letterSpacing:2 },
  formHeaderLine:{ flex:1, height:1, backgroundColor:C.border },
  field:     { marginBottom:16 },
  fieldLbl:  { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:2, textTransform:'uppercase', marginBottom:6 },
  input:     { backgroundColor:C.bg, borderWidth:1, borderColor:C.border, borderRadius:3, paddingHorizontal:14, paddingVertical:12, fontFamily:F.mono, fontSize:13, color:C.text },
  textarea:  { minHeight:95, textAlignVertical:'top', paddingTop:12 },
  submitBtn: { borderWidth:1, borderColor:C.accent, borderRadius:3, paddingVertical:14, alignItems:'center', justifyContent:'center', marginTop:6 },
  submitTxt: { fontFamily:F.mono, fontSize:12, color:C.accent, letterSpacing:2, textTransform:'uppercase' },
  success:   { backgroundColor:C.bg, borderWidth:1, borderColor:'rgba(74,140,92,0.25)', borderRadius:8, padding:28, alignItems:'center', gap:10, marginBottom:24 },
  successIcon:{ fontSize:28, color:C.green, textAlign:'center' },
  successTitle:{ fontFamily:F.display, fontSize:26, color:C.text, letterSpacing:-0.8, fontWeight:'800' },
  successSub: { fontFamily:F.mono, fontSize:12, color:C.muted, textAlign:'center', lineHeight:20 },
  infoGrid:  { flexDirection:'row', flexWrap:'wrap', gap:12, marginTop:28 },
  infoItem:  { width:'46%', flexDirection:'row', gap:10, alignItems:'flex-start', backgroundColor:C.bg, borderWidth:1, borderColor:C.border, borderRadius:6, padding:14 },
  infoIcon:  { fontSize:16, marginTop:1 },
  infoLbl:   { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:1, marginBottom:3 },
  infoVal:   { fontFamily:F.bold, fontSize:12.5, color:C.text, lineHeight:18 },
});

// ─── FOOTER ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <View style={ft.wrap}>
      <LinearGradient colors={[C.surface,C.bg]} style={StyleSheet.absoluteFill}/>
      <Text style={ft.brand}>CBTI</Text>
      <Text style={ft.brandSub}>FOUNDRY FOR MINDS</Text>
      <View style={ft.divider}/>
      <Text style={ft.copy}>Korar Bagan, Bongaon, West Bengal</Text>
      <Text style={ft.copy}>+91 9932848856</Text>
      <Text style={ft.copy2}>© 2025 CBTI · All rights reserved</Text>
      <Text style={ft.copy2}>Government Registered · Community Trusted · Future-Focused</Text>
    </View>
  );
}
const ft = StyleSheet.create({
  wrap:     { padding:32, alignItems:'center', position:'relative', overflow:'hidden' },
  brand:    { fontFamily:F.display, fontSize:36, color:C.accent, letterSpacing:-1.5, fontWeight:'800' },
  brandSub: { fontFamily:F.mono, fontSize:9, color:C.muted, letterSpacing:3.5, textTransform:'uppercase', marginTop:5 },
  divider:  { width:'55%', height:1, backgroundColor:C.border, marginVertical:18 },
  copy:     { fontFamily:F.mono, fontSize:12, color:C.muted, lineHeight:22, textAlign:'center' },
  copy2:    { fontFamily:F.mono, fontSize:10, color:C.faint, lineHeight:18, textAlign:'center' },
});

// ─── STATUS BAR ────────────────────────────────────────────────────────────
function StatusBar_({ insets }) {
  const [time, setTime] = useState(new Date());
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    Animated.loop(Animated.sequence([
      Animated.timing(dotOpacity, { toValue:0.25, duration:1400, useNativeDriver:true }),
      Animated.timing(dotOpacity, { toValue:1, duration:1400, useNativeDriver:true }),
    ])).start();
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2,'0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <View style={[sb.bar, {paddingBottom: insets.bottom + 4}]}>
      <View style={sb.left}>
        <Animated.View style={[sb.dot, {opacity:dotOpacity}]}/>
        <Text style={sb.item}>Vault: <Text style={{color:C.accent2}}>LIVE</Text></Text>
      </View>
      <Text style={sb.clock}>{timeStr} IST</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  bar:  { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'rgba(240,232,213,0.92)', borderTopWidth:1, borderTopColor:C.border, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingTop:6 },
  left: { flexDirection:'row', alignItems:'center', gap:7 },
  dot:  { width:5, height:5, borderRadius:2.5, backgroundColor:C.green, shadowColor:C.green, shadowOpacity:0.9, shadowRadius:4 },
  item: { fontFamily:F.mono, fontSize:9.5, color:C.muted, letterSpacing:1 },
  clock:{ fontFamily:F.mono, fontSize:10, color:C.text2, letterSpacing:1 },
});

// ─── MAIN ──────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const insets   = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const currRef    = useRef(0);
  const pathRef    = useRef(0);
  const contactRef = useRef(0);

  const toHome       = () => scrollRef.current?.scrollTo({ y: 0,                  animated:true });
  const toCurriculum = () => scrollRef.current?.scrollTo({ y: currRef.current,    animated:true });
  const toPath       = () => scrollRef.current?.scrollTo({ y: pathRef.current,    animated:true });
  const toContact    = () => scrollRef.current?.scrollTo({ y: contactRef.current, animated:true });

  return (
    <View style={[ms.root]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg}/>

      <Nav navScrolled={navScrolled} insets={insets} navigation={navigation}
           onHome={toHome} onPath={toPath} onCurriculum={toCurriculum} onContact={toContact}/>

      <ScrollView
        ref={scrollRef}
        onScroll={e => setNavScrolled(e.nativeEvent.contentOffset.y > 55)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 42 }}
      >
        <Hero onCurriculum={toCurriculum} onContact={toContact}/>
        <Divider/>
        <Story/>
        <Divider/>
        <View onLayout={e => currRef.current = e.nativeEvent.layout.y}>
          <Curriculum/>
        </View>
        <Divider/>
        <View onLayout={e => pathRef.current = e.nativeEvent.layout.y}>
          <PathSection/>
        </View>
        <Divider/>
        <View onLayout={e => contactRef.current = e.nativeEvent.layout.y}>
          <Contact/>
        </View>
        <Footer/>
      </ScrollView>

      <StatusBar_ insets={insets}/>
    </View>
  );
}

const ms = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
});
