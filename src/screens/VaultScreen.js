import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, Dimensions, Easing,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, W, H, DAYS, HOURS, HLABELS, HRANGES, TAG_CFG, ADMIN } from '../utils/theme';
import { saveSchedule, loadSchedule, cacheSchedule } from '../utils/storage';
import { subscribeSchedule, isFirebaseConfigured } from '../utils/firebase';

// ─── helpers ───────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(2,'0');
function fmtHour(h) { const h12 = h > 12 ? h-12 : h; return `${h12}:00 ${h<12?'AM':'PM'}`; }
function todayIdx() { const d = new Date().getDay(); return d===0?-1:d-1; }

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(id); },[]);
  return t;
}

// ─── Tag Badge ─────────────────────────────────────────────────────────────
function TagBadge({ color='green' }) {
  const cfg = TAG_CFG[color] || TAG_CFG.green;
  return (
    <View style={[tb.badge,{backgroundColor:cfg.bg,borderColor:cfg.border}]}>
      <Text style={[tb.txt,{color:cfg.text}]}>{cfg.label}</Text>
    </View>
  );
}
const tb = StyleSheet.create({
  badge:{ paddingHorizontal:7,paddingVertical:3,borderRadius:10,borderWidth:1,marginRight:5,marginBottom:3 },
  txt:  { fontFamily:F.mono, fontSize:9, letterSpacing:1 },
});

// ─── Slot Row ──────────────────────────────────────────────────────────────
function SlotRow({ day,hour,idx,data,isCurrent,isAdmin,onEdit }) {
  const h12  = hour > 12 ? hour-12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const sc   = useRef(new Animated.Value(1)).current;

  const press = () => {
    if (!isAdmin) return;
    Animated.sequence([
      Animated.timing(sc,{toValue:0.97,duration:70,useNativeDriver:true}),
      Animated.timing(sc,{toValue:1,duration:70,useNativeDriver:true}),
    ]).start(()=>onEdit(day,hour,idx));
  };

  return (
    <TouchableOpacity onPress={press} activeOpacity={isAdmin?0.85:1}>
      <Animated.View style={[sl.row, isCurrent&&sl.rowCurrent, {transform:[{scale:sc}]}]}>
        {isCurrent && <View style={sl.liveBar}/>}

        {/* Time column */}
        <View style={[sl.timeCol, isCurrent&&sl.timeColCurrent]}>
          <Text style={[sl.th,isCurrent&&{color:C.accent2}]}>{h12}:00</Text>
          <Text style={sl.ampm}>{ampm}</Text>
          <Text style={sl.range}>{HRANGES[idx]}</Text>
        </View>

        {/* Content */}
        <View style={sl.content}>
          {data?.course ? (
            <View style={{flex:1}}>
              <Text style={sl.course} numberOfLines={2}>{data.course}</Text>
              <View style={sl.metaRow}>
                <TagBadge color={data.color||'green'}/>
                {data.batch ? <TagBadge color="muted"/> : null}
                {data.room  ? (
                  <View style={[tb.badge,{backgroundColor:TAG_CFG.muted.bg,borderColor:TAG_CFG.muted.border}]}>
                    <Text style={[tb.txt,{color:TAG_CFG.muted.text}]}>◈ {data.room}</Text>
                  </View>
                ) : null}
              </View>
              {data.batch      && <Text style={sl.meta2}>{data.batch}</Text>}
              {data.instructor && <Text style={sl.meta2}>⊙ {data.instructor}</Text>}
              {data.students   && <Text style={sl.meta2}>◎ {data.students}</Text>}
              {data.note       && <Text style={sl.note} numberOfLines={2}>{data.note}</Text>}
            </View>
          ) : (
            <Text style={sl.empty}>— Free Slot —</Text>
          )}
          {isAdmin && (
            <View style={sl.editBtn}>
              <Text style={sl.editTxt}>✎</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
const sl = StyleSheet.create({
  row:        { flexDirection:'row', borderBottomWidth:1, borderBottomColor:C.border, minHeight:78, backgroundColor:C.surface, position:'relative' },
  rowCurrent: { backgroundColor:'rgba(61,112,128,0.05)' },
  liveBar:    { position:'absolute', left:0,top:0,bottom:0, width:2.5, backgroundColor:C.accent2, zIndex:1 },
  timeCol:    { width:74, paddingVertical:12, paddingHorizontal:9, borderRightWidth:1, borderRightColor:C.border, justifyContent:'center', backgroundColor:'rgba(35,25,15,0.02)' },
  timeColCurrent:{ backgroundColor:'rgba(61,112,128,0.07)' },
  th:         { fontFamily:F.bold, fontSize:18, color:C.text2, lineHeight:22 },
  ampm:       { fontFamily:F.mono, fontSize:8, color:C.muted, letterSpacing:1.5, textTransform:'uppercase', marginTop:2 },
  range:      { fontFamily:F.mono, fontSize:7.5, color:C.faint, marginTop:1 },
  content:    { flex:1, flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:10, gap:8 },
  metaRow:    { flexDirection:'row', flexWrap:'wrap', marginTop:4 },
  course:     { fontFamily:F.bold, fontSize:14, color:C.text, letterSpacing:-0.3, lineHeight:19, marginBottom:3 },
  meta2:      { fontFamily:F.mono, fontSize:10, color:C.muted, marginTop:1 },
  note:       { fontFamily:F.mono, fontSize:10, color:C.text2, lineHeight:16, marginTop:4 },
  empty:      { fontFamily:F.mono, fontSize:11, color:C.faint, fontStyle:'italic', flex:1 },
  editBtn:    { width:32,height:32,backgroundColor:'rgba(35,25,15,0.07)',borderRadius:6,alignItems:'center',justifyContent:'center' },
  editTxt:    { fontSize:14, color:C.muted },
});

// ─── Stats Row ─────────────────────────────────────────────────────────────
function Stats({ scheduleData, selectedDay, now }) {
  const todDay = DAYS[todayIdx()];
  const nowH   = now.getHours();
  let filled=0, cur=null, nxt=null;
  HOURS.forEach(h=>{
    const d = scheduleData[`${selectedDay}:${h}`];
    if(d?.course){ filled++; }
    if(selectedDay===todDay){
      if(d?.course && h===nowH) cur=d;
      if(d?.course && h>nowH && !nxt) nxt={h,d};
    }
  });
  const items = [
    {val:String(filled),          lbl:'Active Slots',  sub:'on selected day'},
    {val:String(HOURS.length-filled), lbl:'Free Slots', sub:'available hours'},
    {val:cur?fmtHour(nowH):'—',   lbl:'Current Slot',  sub:cur?cur.course.slice(0,20):(selectedDay===todDay?'Free now':'Not today')},
    {val:nxt?fmtHour(nxt.h):'—',  lbl:'Next Class',    sub:nxt?nxt.d.course.slice(0,20):'None today'},
  ];
  return (
    <View style={st.row}>
      {items.map(i=>(
        <View key={i.lbl} style={st.card}>
          <LinearGradient colors={['rgba(156,106,48,0.05)','transparent']} style={StyleSheet.absoluteFill}/>
          <Text style={st.val}>{i.val}</Text>
          <Text style={st.lbl}>{i.lbl}</Text>
          <Text style={st.sub} numberOfLines={1}>{i.sub}</Text>
        </View>
      ))}
    </View>
  );
}
const st = StyleSheet.create({
  row:  { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 },
  card: { flex:1, minWidth:(W-52)/2, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:8, padding:14, overflow:'hidden' },
  val:  { fontFamily:F.display, fontSize:28, fontWeight:'800', color:C.accent, lineHeight:32 },
  lbl:  { fontFamily:F.mono, fontSize:8.5, color:C.muted, letterSpacing:1.5, textTransform:'uppercase', marginTop:3 },
  sub:  { fontFamily:F.mono, fontSize:9.5, color:C.text2, marginTop:2 },
});

// ─── Edit Modal (bottom sheet) ──────────────────────────────────────────────
function EditModal({ visible, day, hour, idx, data, onSave, onClear, onClose }) {
  const [course,     setCourse]     = useState('');
  const [instructor, setInstructor] = useState('');
  const [students,   setStudents]   = useState('');
  const [batch,      setBatch]      = useState('');
  const [room,       setRoom]       = useState('');
  const [note,       setNote]       = useState('');
  const [color,      setColor]      = useState('green');
  const slideY = useRef(new Animated.Value(H)).current;

  useEffect(()=>{
    if(visible){
      setCourse(data?.course||''); setInstructor(data?.instructor||'');
      setStudents(data?.students||''); setBatch(data?.batch||'');
      setRoom(data?.room||''); setNote(data?.note||'');
      setColor(data?.color||'green');
      Animated.spring(slideY,{toValue:0,friction:10,tension:65,useNativeDriver:true}).start();
    } else {
      Animated.timing(slideY,{toValue:H,duration:280,easing:Easing.in(Easing.quad),useNativeDriver:true}).start();
    }
  },[visible,data]);

  const save = () => { if(!course.trim()){onClear();return;} onSave({course:course.trim(),instructor:instructor.trim(),students:students.trim(),batch:batch.trim(),room:room.trim(),note:note.trim(),color,updated:Date.now()}); };
  const hourLabel = idx!==null ? HLABELS[idx] : '';
  const rangeLabel= idx!==null ? HRANGES[idx] : '';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <TouchableOpacity style={em.backdrop} activeOpacity={1} onPress={onClose}/>
        <Animated.View style={[em.sheet,{transform:[{translateY:slideY}]}]}>
          <View style={em.handle}/>
          <View style={em.hdr}>
            <View>
              <Text style={em.title}>Edit · {hourLabel}</Text>
              <Text style={em.tLabel}>{day} · {rangeLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={em.closeBtn}>
              <Text style={em.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <MField label="Course / Subject">
              <TextInput value={course} onChangeText={setCourse} placeholder="e.g. Financial Accounting (Tally)" placeholderTextColor={C.faint} style={em.input}/>
            </MField>
            <View style={em.row}>
              <View style={{flex:1}}>
                <MField label="Instructor">
                  <TextInput value={instructor} onChangeText={setInstructor} placeholder="Teacher name" placeholderTextColor={C.faint} style={em.input}/>
                </MField>
              </View>
              <View style={{flex:1}}>
                <MField label="Students">
                  <TextInput value={students} onChangeText={setStudents} placeholder="e.g. 12 students" placeholderTextColor={C.faint} style={em.input}/>
                </MField>
              </View>
            </View>
            <View style={em.row}>
              <View style={{flex:1}}>
                <MField label="Batch ID">
                  <TextInput value={batch} onChangeText={setBatch} placeholder="e.g. B-04 · Morning" placeholderTextColor={C.faint} style={em.input}/>
                </MField>
              </View>
              <View style={{flex:1}}>
                <MField label="Room / Lab">
                  <TextInput value={room} onChangeText={setRoom} placeholder="e.g. Lab 1" placeholderTextColor={C.faint} style={em.input}/>
                </MField>
              </View>
            </View>
            <MField label="Notes">
              <TextInput value={note} onChangeText={setNote} placeholder="Additional info, remarks…" placeholderTextColor={C.faint} multiline numberOfLines={3} style={[em.input,{minHeight:75,textAlignVertical:'top',paddingTop:10}]}/>
            </MField>
            <MField label="Tag Color">
              <View style={em.colorRow}>
                {Object.entries(TAG_CFG).map(([k,v])=>(
                  <TouchableOpacity key={k} onPress={()=>setColor(k)}
                    style={[em.swatch,{backgroundColor:v.bg,borderColor:color===k?v.text:v.border,borderWidth:color===k?2:1}]}>
                    {color===k && <Text style={{color:v.text,fontSize:11}}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </MField>
            <View style={em.actions}>
              <TouchableOpacity onPress={save} style={em.saveBtn}>
                <LinearGradient colors={[C.accent,'#7a5025']} start={{x:0,y:0}} end={{x:1,y:0}} style={em.saveGrad}>
                  <Text style={em.saveTxt}>SAVE SLOT</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClear} style={em.clearBtn}>
                <Text style={em.clearTxt}>CLEAR</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function MField({label,children}){ return <View style={em.field}><Text style={em.fieldLbl}>{label}</Text>{children}</View>; }
const em = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(18,14,10,0.55)' },
  sheet:    { backgroundColor:C.bg, borderTopLeftRadius:16, borderTopRightRadius:16, borderTopWidth:1, borderColor:C.border, maxHeight:H*0.9, paddingHorizontal:20, paddingBottom:24 },
  handle:   { width:36,height:4,backgroundColor:C.faint,borderRadius:2,alignSelf:'center',marginVertical:10 },
  hdr:      { flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 },
  title:    { fontFamily:F.display,fontSize:20,fontWeight:'800',color:C.text,letterSpacing:-0.5 },
  tLabel:   { fontFamily:F.mono,fontSize:9.5,color:C.accent,letterSpacing:1.5,marginTop:3 },
  closeBtn: { width:28,height:28,backgroundColor:C.glass,borderRadius:6,borderWidth:1,borderColor:C.border,alignItems:'center',justifyContent:'center' },
  closeTxt: { fontFamily:F.mono,fontSize:11,color:C.muted },
  field:    { marginBottom:12 },
  fieldLbl: { fontFamily:F.mono,fontSize:8.5,color:C.muted,letterSpacing:1.8,textTransform:'uppercase',marginBottom:5 },
  input:    { backgroundColor:C.surface,borderWidth:1,borderColor:C.border,borderRadius:5,paddingHorizontal:12,paddingVertical:10,fontFamily:F.mono,fontSize:12.5,color:C.text },
  row:      { flexDirection:'row',gap:10 },
  colorRow: { flexDirection:'row',gap:8,marginTop:4 },
  swatch:   { width:30,height:30,borderRadius:6,alignItems:'center',justifyContent:'center' },
  actions:  { flexDirection:'row',gap:10,marginTop:6,marginBottom:6 },
  saveBtn:  { flex:1,borderRadius:5,overflow:'hidden' },
  saveGrad: { paddingVertical:14,alignItems:'center' },
  saveTxt:  { fontFamily:F.display,fontSize:12,color:'#f5edd8',letterSpacing:1.8 },
  clearBtn: { paddingVertical:14,paddingHorizontal:18,borderWidth:1,borderColor:'rgba(160,69,53,0.3)',borderRadius:5 },
  clearTxt: { fontFamily:F.mono,fontSize:11,color:C.accent3,letterSpacing:1.5 },
});

// ─── Login Modal ────────────────────────────────────────────────────────────
function LoginModal({ visible, onSuccess, onClose }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');
  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () => Animated.sequence([
    Animated.timing(shakeX,{toValue:9,duration:55,useNativeDriver:true}),
    Animated.timing(shakeX,{toValue:-9,duration:55,useNativeDriver:true}),
    Animated.timing(shakeX,{toValue:6,duration:55,useNativeDriver:true}),
    Animated.timing(shakeX,{toValue:-6,duration:55,useNativeDriver:true}),
    Animated.timing(shakeX,{toValue:0,duration:55,useNativeDriver:true}),
  ]).start();

  const login = () => {
    if(user===ADMIN.user && pass===ADMIN.pass){
      setErr(''); setUser(''); setPass(''); onSuccess();
    } else {
      setErr('⚠ Invalid credentials'); shake();
      setTimeout(()=>setErr(''),2200);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={lm.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}>
          <Animated.View style={[lm.card,{transform:[{translateX:shakeX}]}]}>
            <TouchableOpacity style={lm.cancel} onPress={onClose}>
              <Text style={lm.cancelTxt}>✕ Cancel</Text>
            </TouchableOpacity>
            <View style={lm.emblem}><Text style={lm.emblemTxt}>⬡</Text></View>
            <Text style={lm.title}>Admin Access</Text>
            <Text style={lm.sub}>BATCH SCHEDULE MANAGEMENT</Text>
            <View style={lm.field}>
              <Text style={lm.fieldLbl}>User ID</Text>
              <TextInput value={user} onChangeText={setUser} placeholder="Enter user ID" placeholderTextColor="#3a3028" autoCapitalize="none" style={lm.input}/>
            </View>
            <View style={lm.field}>
              <Text style={lm.fieldLbl}>Access Code</Text>
              <TextInput value={pass} onChangeText={setPass} placeholder="Enter access code" placeholderTextColor="#3a3028" secureTextEntry onSubmitEditing={login} style={lm.input}/>
            </View>
            {!!err && <Text style={lm.err}>{err}</Text>}
            <TouchableOpacity onPress={login} style={lm.loginBtn} activeOpacity={0.85}>
              <View style={lm.loginInner}>
                <Text style={lm.loginTxt}>ACCESS VAULT →</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
const lm = StyleSheet.create({
  overlay:  { flex:1,backgroundColor:'rgba(18,14,10,0.92)',alignItems:'center',justifyContent:'center' },
  card:     { width:Math.min(W-40,390),backgroundColor:'rgba(30,24,15,0.92)',borderWidth:1,borderColor:'rgba(156,106,48,0.22)',borderRadius:10,padding:28,alignItems:'stretch' },
  cancel:   { position:'absolute',top:12,right:16 },
  cancelTxt:{ fontFamily:F.mono,fontSize:11,color:'#3a3028' },
  emblem:   { width:52,height:52,borderRadius:26,borderWidth:1,borderColor:'rgba(156,106,48,0.3)',backgroundColor:'rgba(156,106,48,0.09)',alignSelf:'center',alignItems:'center',justifyContent:'center',marginBottom:14 },
  emblemTxt:{ fontFamily:F.display,fontSize:22,color:'#d4c4a0' },
  title:    { fontFamily:F.display,fontSize:22,color:'#d4c4a0',letterSpacing:-0.8,textAlign:'center',marginBottom:4 },
  sub:      { fontFamily:F.mono,fontSize:8.5,color:'#5a4e3a',letterSpacing:2.2,textTransform:'uppercase',textAlign:'center',marginBottom:24 },
  field:    { marginBottom:14 },
  fieldLbl: { fontFamily:F.mono,fontSize:8.5,color:'#6b5e48',letterSpacing:2,textTransform:'uppercase',marginBottom:5 },
  input:    { backgroundColor:'rgba(255,248,235,0.04)',borderWidth:1,borderColor:'rgba(156,106,48,0.2)',color:'#d4c4a0',fontFamily:F.mono,fontSize:13,padding:12,borderRadius:4 },
  err:      { fontFamily:F.mono,fontSize:10.5,color:C.accent3,textAlign:'center',marginBottom:12,letterSpacing:1 },
  loginBtn: { borderRadius:4,borderWidth:1,borderColor:'rgba(156,106,48,0.38)',overflow:'hidden' },
  loginInner:{ backgroundColor:'rgba(156,106,48,0.14)',paddingVertical:14,alignItems:'center' },
  loginTxt: { fontFamily:F.display,fontSize:13,color:'#d4c4a0',letterSpacing:2 },
});

// ─── Main Vault Screen ──────────────────────────────────────────────────────
export default function VaultScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const now    = useClock();
  const [schedule,  setSchedule]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);
  const [editSlot,  setEditSlot]  = useState({day:null,hour:null,idx:null});
  const [selDay,    setSelDay]    = useState(()=>{const i=todayIdx();return i>=0?DAYS[i]:DAYS[0];});
  const [navScrolled, setNavScrolled] = useState(false);
  const dotPulse = useRef(new Animated.Value(1)).current;

  // ── Real-time sync: show a [LIVE] indicator and Firebase-sync status ──────
  const [syncStatus, setSyncStatus] = useState('connecting'); // 'connecting' | 'live' | 'offline'

  useEffect(()=>{
    // 1. Paint immediately from local cache (zero flicker)
    loadSchedule().then(cached => {
      setSchedule(cached);
      setLoading(false);
    });

    // 2. Subscribe to Firebase — overwrites local data whenever admin saves
    if (!isFirebaseConfigured()) {
      setSyncStatus('offline');
      return;
    }

    const unsub = subscribeSchedule(
      (cloudData) => {
        setSchedule(cloudData);
        setLoading(false);
        setSyncStatus('live');
        cacheSchedule(cloudData); // keep local cache fresh for offline use
      },
      () => setSyncStatus('offline'),
    );

    return unsub; // cleanup on unmount
  },[]);

  useEffect(()=>{
    if(isAdmin){
      Animated.loop(Animated.sequence([
        Animated.timing(dotPulse,{toValue:0.2,duration:1400,useNativeDriver:true}),
        Animated.timing(dotPulse,{toValue:1,duration:1400,useNativeDriver:true}),
      ])).start();
    }
  },[isAdmin]);

  const todDay = DAYS[todayIdx()];
  const nowH   = now.getHours();
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} IST`;
  const dayStr  = now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'});

  const editData = editSlot.day ? schedule[`${editSlot.day}:${editSlot.hour}`]||null : null;

  const handleEdit = useCallback((day,hour,idx)=>{
    if(!isAdmin) return;
    setEditSlot({day,hour,idx}); setShowEdit(true);
  },[isAdmin]);

  const handleSave = useCallback(async(data)=>{
    const key = `${editSlot.day}:${editSlot.hour}`;
    const nd  = {...schedule,[key]:data};
    setSchedule(nd); await saveSchedule(nd); setShowEdit(false);
  },[editSlot,schedule]);

  const handleClear = useCallback(async()=>{
    const key = `${editSlot.day}:${editSlot.hour}`;
    const nd  = {...schedule}; delete nd[key];
    setSchedule(nd); await saveSchedule(nd); setShowEdit(false);
  },[editSlot,schedule]);

  return (
    <View style={vs.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg}/>

      {/* NAV */}
      <View style={[vs.nav, navScrolled&&vs.navScrolled, {paddingTop:insets.top+8}]}>
        <Text style={vs.navBrand}>CBTI</Text>
        <View style={vs.navSep}/>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Text style={vs.navBack}>← Main Site</Text>
        </TouchableOpacity>
        <View style={vs.navSep}/>
        <View style={[vs.navBadge, isAdmin?vs.nbAdmin:vs.nbLocked]}>
          <Text style={[vs.navBadgeTxt,{color:isAdmin?C.accent2:C.muted}]}>
            {isAdmin?'⬡ Admin Mode':'⬡ Vault'}
          </Text>
        </View>
      </View>

      <ScrollView
        onScroll={e=>setNavScrolled(e.nativeEvent.contentOffset.y>40)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[vs.content,{paddingTop:insets.top+72,paddingBottom:insets.bottom+52}]}
      >
        {/* Page header */}
        <View style={vs.pageHdr}>
          <View>
            <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:10}}>
              <View style={{width:24,height:1,backgroundColor:C.accent2}}/>
              <Text style={{fontFamily:F.mono,fontSize:9,color:C.accent2,letterSpacing:2,textTransform:'uppercase'}}>Personal Vault · Batch Command Centre</Text>
            </View>
            <Text style={vs.pageTitle}>Schedule{'\n'}<Text style={{color:C.accent}}>Matrix</Text></Text>
            <Text style={vs.pageSub}>Live batch schedule · 8AM – 8PM · {isAdmin?'Tap any slot to edit.':'Admin login required to edit.'}</Text>
          </View>
          <View style={{alignItems:'flex-end',gap:8}}>
            {isAdmin&&(
              <View style={vs.adminBadge}>
                <Animated.View style={[vs.adminDot,{opacity:dotPulse}]}/>
                <Text style={vs.adminBadgeTxt}>Admin Mode</Text>
              </View>
            )}
            {isAdmin
              ? <TouchableOpacity onPress={()=>setIsAdmin(false)} style={vs.logoutBtn}><Text style={vs.logoutTxt}>↩ Logout</Text></TouchableOpacity>
              : <TouchableOpacity onPress={()=>setShowLogin(true)} style={vs.loginBtn}><Text style={vs.loginBtnTxt}>⬡ Admin Login</Text></TouchableOpacity>
            }
          </View>
        </View>

        {/* Stats */}
        {!loading && <Stats scheduleData={schedule} selectedDay={selDay} now={now}/>}

        {/* Day selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}} contentContainerStyle={{gap:8,paddingVertical:2}}>
          {DAYS.map((day,i)=>{
            const isToday = i===todayIdx();
            const isActive= day===selDay;
            return (
              <TouchableOpacity key={day} onPress={()=>setSelDay(day)}
                style={[vs.dayBtn, isActive&&vs.dayBtnActive, isToday&&!isActive&&vs.dayBtnToday, isActive&&isToday&&vs.dayBtnTodayActive]}>
                <Text style={[vs.dayBtnTxt, isActive&&{color:'#f5edd8'}, isToday&&!isActive&&{color:C.accent2}]}>
                  {day}{isToday?' ·Today':''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Schedule grid */}
        {loading
          ? <View style={{alignItems:'center',padding:40,gap:12}}><ActivityIndicator color={C.accent}/><Text style={{fontFamily:F.mono,fontSize:11,color:C.muted,letterSpacing:1}}>Loading schedule...</Text></View>
          : (
            <View style={vs.grid}>
              {HOURS.map((h,idx)=>(
                <SlotRow
                  key={`${selDay}:${h}`}
                  day={selDay} hour={h} idx={idx}
                  data={schedule[`${selDay}:${h}`]||null}
                  isCurrent={selDay===todDay&&nowH===h}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                />
              ))}
            </View>
          )
        }

        {/* Footer */}
        <View style={{alignItems:'center',paddingVertical:24,gap:4}}>
          <Text style={{fontFamily:F.display,fontSize:26,color:C.accent,fontWeight:'800'}}>CBTI</Text>
          <Text style={{fontFamily:F.mono,fontSize:9,color:C.muted,letterSpacing:2.5,textTransform:'uppercase'}}>Batch Schedule · Personal Vault</Text>
          <Text style={{fontFamily:F.mono,fontSize:11,color:C.muted,marginTop:6}}>Korar Bagan, Bongaon · +91 9932848856</Text>
          <Text style={{fontFamily:F.mono,fontSize:10,color:C.faint}}>© 2025 CBTI · All rights reserved</Text>
        </View>
      </ScrollView>

      {/* Status bar */}
      <View style={[vs.statusBar,{paddingBottom:insets.bottom+4}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:7}}>
          <View style={[vs.statusDot,{
            backgroundColor: syncStatus==='live' ? C.green : syncStatus==='offline' ? C.accent3 : C.amber,
            shadowColor:     syncStatus==='live' ? C.green : syncStatus==='offline' ? C.accent3 : C.amber,
          }]}/>
          <Text style={vs.statusTxt}>
            {syncStatus==='live' ? 'LIVE · ALL DEVICES SYNCED' : syncStatus==='offline' ? 'OFFLINE · LOCAL DATA' : 'CONNECTING...'}
          </Text>
        </View>
        <View style={{flexDirection:'row',gap:10,alignItems:'center'}}>
          <Text style={vs.statusTxt}>{dayStr}</Text>
          <Text style={[vs.statusTxt,{color:C.text2,fontFamily:F.monoMd}]}>{timeStr}</Text>
        </View>
      </View>

      <LoginModal visible={showLogin} onSuccess={()=>{setIsAdmin(true);setShowLogin(false);}} onClose={()=>setShowLogin(false)}/>
      <EditModal visible={showEdit} day={editSlot.day} hour={editSlot.hour} idx={editSlot.idx} data={editData} onSave={handleSave} onClear={handleClear} onClose={()=>setShowEdit(false)}/>
    </View>
  );
}

const vs = StyleSheet.create({
  root:    { flex:1, backgroundColor:C.bg },
  nav:     { position:'absolute',top:0,left:0,right:0,zIndex:100,flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingBottom:10,backgroundColor:'rgba(240,232,213,0.82)' },
  navScrolled:{ backgroundColor:'rgba(240,232,213,0.96)',borderBottomWidth:1,borderBottomColor:C.border,shadowColor:'#000',shadowOpacity:0.06,shadowRadius:8,elevation:3 },
  navBrand:{ fontFamily:F.display,fontSize:17,color:C.accent,letterSpacing:-0.5 },
  navSep:  { width:1,height:13,backgroundColor:C.border,marginHorizontal:10 },
  navBack: { fontFamily:F.mono,fontSize:9.5,color:C.muted,letterSpacing:1 },
  navBadge:{ paddingHorizontal:10,paddingVertical:3,borderRadius:12,borderWidth:1 },
  nbLocked:{ borderColor:C.border,backgroundColor:C.glass },
  nbAdmin: { borderColor:'rgba(61,112,128,0.3)',backgroundColor:'rgba(61,112,128,0.08)' },
  navBadgeTxt:{ fontFamily:F.mono,fontSize:9,letterSpacing:1 },
  content: { paddingHorizontal:20 },
  pageHdr: { flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:24 },
  pageTitle:{ fontFamily:F.display,fontSize:Math.min(W*0.13,50),fontWeight:'800',color:C.text,letterSpacing:-2,lineHeight:Math.min(W*0.13,50)*1.05,marginBottom:6 },
  pageSub: { fontFamily:F.mono,fontSize:11.5,color:C.muted,lineHeight:19,maxWidth:280 },
  adminBadge:{ flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(61,112,128,0.08)',borderWidth:1,borderColor:'rgba(61,112,128,0.22)',paddingHorizontal:10,paddingVertical:5,borderRadius:20 },
  adminDot:  { width:5,height:5,borderRadius:2.5,backgroundColor:C.accent2 },
  adminBadgeTxt:{ fontFamily:F.mono,fontSize:9,color:C.accent2,letterSpacing:1 },
  logoutBtn: { paddingHorizontal:14,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.glass },
  logoutTxt: { fontFamily:F.mono,fontSize:9.5,color:C.muted,letterSpacing:1 },
  loginBtn:  { paddingHorizontal:14,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:'rgba(61,112,128,0.28)',backgroundColor:'rgba(61,112,128,0.06)' },
  loginBtnTxt:{ fontFamily:F.mono,fontSize:9.5,color:C.accent2,letterSpacing:1 },
  dayBtn:    { paddingHorizontal:14,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:C.border },
  dayBtnActive:{ backgroundColor:C.accent,borderColor:C.accent,shadowColor:C.accent,shadowOpacity:0.28,shadowRadius:8,elevation:4 },
  dayBtnToday: { borderColor:'rgba(61,112,128,0.4)' },
  dayBtnTodayActive:{ backgroundColor:C.accent2,borderColor:C.accent2 },
  dayBtnTxt: { fontFamily:F.mono,fontSize:10,color:C.muted,letterSpacing:0.5 },
  grid:      { borderWidth:1,borderColor:C.border,borderRadius:8,overflow:'hidden',marginBottom:28 },
  statusBar: { position:'absolute',bottom:0,left:0,right:0,backgroundColor:'rgba(240,232,213,0.93)',borderTopWidth:1,borderTopColor:C.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingTop:6 },
  statusDot: { width:5,height:5,borderRadius:2.5,backgroundColor:C.green,shadowColor:C.green,shadowOpacity:0.9,shadowRadius:4 },
  statusTxt: { fontFamily:F.mono,fontSize:9,color:C.muted,letterSpacing:1 },
});
