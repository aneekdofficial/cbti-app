import { Dimensions } from 'react-native';
import Constants from 'expo-constants';

export const { width: W, height: H } = Dimensions.get('window');

export const C = {
  bg:         '#f0e8d5',
  surface:    '#e8dfc8',
  surface2:   '#dfd4b8',
  dark:       '#18140e',
  dark2:      '#221c12',
  accent:     '#9c6a30',
  accent2:    '#3d7080',
  accent3:    '#a04535',
  green:      '#4a8c5c',
  amber:      '#c4883a',
  violet:     '#6b5aaa',
  text:       '#231e15',
  text2:      '#4a3e2e',
  muted:      '#8a7a64',
  faint:      '#c4b89a',
  border:     'rgba(35,25,15,0.10)',
  glass:      'rgba(35,25,15,0.04)',
  darkText:   '#d4c4a0',
  darkMuted:  '#6b5e48',
  darkFaint:  '#3a3028',
};

export const F = {
  display:  'Syne_800ExtraBold',
  bold:     'Syne_700Bold',
  semi:     'Syne_600SemiBold',
  reg:      'Syne_400Regular',
  mono:     'JetBrainsMono_400Regular',
  monoMd:   'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  monoLt:   'JetBrainsMono_300Light',
};

export const COURSES = [
  { num:'01', tag:'Exhibit · 01', title:'Computer Application & Data Entry',
    desc:'Master the foundational language of the digital workplace. From touch-typing velocity to database precision — this is where the journey begins.',
    duration:'6 Months', fee:'₹250', unit:'per month', special:false },
  { num:'02', tag:'Exhibit · 02', title:'Desktop Publishing (D.T.P.)',
    desc:'Adobe Suite mastery with native Bengali font support. Print design, layout architecture, and the art of visual communication.',
    duration:'6 Months', fee:'₹300', unit:'per month', special:false },
  { num:'03', tag:'Exhibit · 03', title:'Financial Accounting',
    desc:'Tally Prime, GST e-Filing, and digital ledger management. Bridge the gap between numbers and the language of modern commerce.',
    duration:'6 Months', fee:'₹300', unit:'per month', special:false },
  { num:'04', tag:'Exhibit · 04', title:'Multimedia & Video Mixing',
    desc:'3D Max, Premiere Pro, and Sound Editing. Craft narratives from pixels and waveforms. The future speaks in motion and audio.',
    duration:'6 Months', fee:'₹300', unit:'per month', special:false },
  { num:'05', tag:'Exhibit · 05', title:'Hardware & Networking',
    desc:'100% hands-on assembly, troubleshooting, and network architecture. Learn to hear what machines are saying.',
    duration:'6 Months', fee:'₹300', unit:'per month', special:false },
  { num:'06', tag:'Exhibit · 06', title:'Web Page Design',
    desc:'HTML, Dreamweaver, and Photoshop — a 3-month intensive that transforms you from a browser to a builder.',
    duration:'3 Months', fee:'₹300', unit:'per month', special:false },
  { num:'07', tag:'Exhibit · 07', title:'Programming',
    desc:"C, C++, and Visual Basic. The grammar of machines. Think algorithmically, solve systematically, build what didn't exist.",
    duration:'6 Months', fee:'₹300', unit:'per month', special:false },
  { num:'∞', tag:'Specialized Track', title:'Complete Tally Solution',
    desc:'A comprehensive standalone Tally mastery program. Ledger creation to full GST compliance for professionals.',
    duration:'Flexible', fee:'₹1500', unit:'full program', special:true },
  { num:'⊕', tag:'Specialized Track', title:'School & Spoken English',
    desc:'Tailored school-level computer courses and Spoken English programs. Communication is the original technology.',
    duration:'Flexible', fee:'Enquire', unit:'contact us', special:true },
];

export const STAGES = [
  { num:'STAGE · 01', title:'Initiation',
    desc:'Arrive as you are. We assess your current skill signature and map the fastest path to where you need to be.' },
  { num:'STAGE · 02', title:'Immersion',
    desc:'Hands-on, environment-first learning. No passive lectures — only active building, breaking, and rebuilding.' },
  { num:'STAGE · 03', title:'Mastery',
    desc:'Real projects, real feedback, real-world problem solving. Theory crystallizes into demonstrable skill.' },
  { num:'STAGE · 04', title:'Launch',
    desc:'Government-recognized certification and a community of CBTI graduates who continue to build together.' },
];

export const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const HOURS   = [8,9,10,11,12,13,14,15,16,17,18,19];
export const HLABELS = ['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM'];
export const HRANGES = ['8:00–9:00','9:00–10:00','10:00–11:00','11:00–12:00','12:00–1:00','1:00–2:00','2:00–3:00','3:00–4:00','4:00–5:00','5:00–6:00','6:00–7:00','7:00–8:00'];

export const TAG_CFG = {
  'green':  { bg:'rgba(74,140,92,0.14)',  border:'rgba(74,140,92,0.28)',  text:'#4a8c5c',  label:'Active'      },
  'amber':  { bg:'rgba(156,106,48,0.14)', border:'rgba(156,106,48,0.28)', text:'#c4883a',  label:'In Progress' },
  'teal':   { bg:'rgba(61,112,128,0.14)', border:'rgba(61,112,128,0.28)', text:'#3d7080',  label:'Special'     },
  'violet': { bg:'rgba(107,90,170,0.12)', border:'rgba(107,90,170,0.24)', text:'#6b5aaa',  label:'Advanced'    },
  'rose':   { bg:'rgba(160,69,53,0.12)',  border:'rgba(160,69,53,0.24)',  text:'#a04535',  label:'Exam'        },
  'muted':  { bg:'rgba(35,25,15,0.06)',   border:'rgba(35,25,15,0.12)',   text:'#8a7a64',  label:'General'     },
};

// ── Admin credentials — read from app.config.js extra (injected at build time) ──
const extra = Constants.expoConfig?.extra ?? {};

export const ADMIN = {
  user: extra.adminUser || 'cbti',
  pass: extra.adminPass || 'passwordcbti9932848856',
};

export const STORAGE_KEY = 'cbti_schedule_v2';

export const EMAILJS = {
  publicKey:  extra.emailjsPublicKey  || '1KT-EY038yGqp2BTZ',
  templateId: extra.emailjsTemplateId || 'template_b1lcp2w',
  serviceId:  extra.emailjsServiceId  || 'service_cibhwx6',
};
