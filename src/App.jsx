import React, { useState, useMemo } from 'react';
import { 
  Baby, Scale, Ruler, Calendar, CheckCircle2, 
  Target, Heart, RefreshCw, Info, Timer, 
  TrendingUp, ShieldCheck, BookOpen, AlertTriangle,
  ChevronDown, ChevronUp, CalendarPlus, ExternalLink
} from 'lucide-react';

// ==========================================
// DỮ LIỆU THAM CHIẾU Y KHOA (Số hóa từ WHO 2007 & Fenton 2013)
// ==========================================
const DATA = {
  fenton: {
    boy: {
      weight: {
        24: [0.38, 0.45, 0.52, 0.60, 0.70, 0.81, 0.95],
        32: [1.25, 1.45, 1.65, 1.90, 2.20, 2.55, 2.95],
        40: [2.50, 2.85, 3.20, 3.60, 4.10, 4.60, 5.20],
        50: [4.20, 4.80, 5.40, 6.10, 6.90, 7.80, 8.80]
      },
      height: {
        24: [21.5, 23.0, 24.5, 26.0, 27.5, 29.0, 30.5],
        40: [46.5, 48.2, 50.0, 51.5, 53.5, 55.5, 57.5],
        50: [53.0, 55.5, 58.0, 60.5, 63.0, 65.5, 68.0]
      }
    },
    girl: {
      weight: {
        24: [0.35, 0.42, 0.49, 0.57, 0.67, 0.78, 0.92],
        40: [2.40, 2.75, 3.10, 3.50, 4.00, 4.50, 5.10],
        50: [4.00, 4.60, 5.20, 5.90, 6.70, 7.60, 8.60]
      },
      height: {
        24: [21.0, 22.5, 24.0, 25.5, 27.0, 28.5, 30.0],
        40: [45.5, 47.5, 49.3, 51.0, 53.0, 55.0, 57.0],
        50: [52.0, 54.5, 57.0, 59.5, 62.0, 64.5, 67.0]
      }
    }
  },
  who: {
    boy: {
      bmi: {
        0: [10.1, 11.1, 12.2, 13.4, 14.7, 16.3, 18.1],
        12: [14.4, 15.5, 16.8, 18.2, 19.8, 21.6, 23.6],
        24: [13.0, 14.1, 15.3, 16.6, 18.1, 19.7, 21.6],
        60: [12.1, 13.0, 14.1, 15.3, 16.9, 18.8, 21.3],
        144: [13.0, 14.1, 15.5, 17.5, 20.2, 24.2, 30.2]
      },
      height: {
        0: [44.2, 46.1, 48.0, 49.9, 51.8, 53.7, 55.6],
        24: [81.0, 84.1, 87.1, 90.2, 93.2, 96.3, 99.3],
        60: [94.9, 100.7, 105.3, 110.0, 114.6, 119.2, 123.9],
        144: [132.5, 139.1, 144.0, 149.1, 154.1, 159.0, 164.1]
      }
    },
    girl: {
      bmi: {
        0: [9.4, 10.4, 11.5, 12.7, 14.1, 15.8, 17.8],
        24: [12.7, 13.7, 14.9, 16.2, 17.8, 19.6, 21.7],
        60: [11.8, 12.7, 13.8, 15.0, 16.7, 18.7, 21.3],
        144: [12.9, 14.1, 15.7, 18.0, 21.1, 25.4, 31.9]
      },
      height: {
        0: [43.6, 45.4, 47.3, 49.1, 51.0, 52.9, 54.7],
        24: [80.0, 83.2, 85.7, 88.9, 92.1, 95.2, 98.4],
        60: [94.1, 99.9, 104.7, 109.4, 114.0, 118.8, 123.5],
        144: [132.2, 138.6, 143.9, 149.1, 154.4, 159.8, 165.2]
      }
    }
  }
};

export default function App() {
  const [gender, setGender] = useState('boy');
  const [ageValue, setAgeValue] = useState('');
  const [ageUnit, setAgeUnit] = useState('months');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isPreterm, setIsPreterm] = useState(false);
  const [gestWeeks, setGestWeeks] = useState(30);
  const [result, setResult] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false); 

  const theme = useMemo(() => ({
    primary: gender === 'boy' ? 'bg-blue-600' : 'bg-rose-500',
    hover: gender === 'boy' ? 'hover:bg-blue-700' : 'hover:bg-rose-600',
    soft: gender === 'boy' ? 'bg-blue-50/50' : 'bg-rose-50/50',
    ring: gender === 'boy' ? 'focus:ring-blue-500' : 'focus:ring-rose-500',
    text: gender === 'boy' ? 'text-blue-600' : 'text-rose-600',
    border: gender === 'boy' ? 'border-blue-100' : 'border-rose-100',
    gradient: gender === 'boy' ? 'from-blue-600 to-indigo-500' : 'from-rose-500 to-pink-500',
    accent: gender === 'boy' ? 'text-blue-400' : 'text-rose-400',
  }), [gender]);

  const interpolate = (val, dataMap) => {
    const keys = Object.keys(dataMap).map(Number).sort((a, b) => a - b);
    let low = keys[0], high = keys[keys.length - 1];
    for (let k of keys) {
      if (k <= val) low = k;
      if (k >= val) { high = k; break; }
    }
    if (low === high) return dataMap[low];
    const ratio = (val - low) / (high - low);
    return dataMap[low].map((v, i) => v + ratio * (dataMap[high][i] - v));
  };

  const calculate = () => {
    const nWeight = parseFloat(weight);
    const nHeight = parseFloat(height);
    const vAge = parseFloat(ageValue);
    if (!nWeight || !nHeight || isNaN(vAge)) return;

    let nAgeDays = 0;
    if (ageUnit === 'days') nAgeDays = vAge;
    else if (ageUnit === 'months') nAgeDays = vAge * 30.44;
    else if (ageUnit === 'years') nAgeDays = vAge * 365.25;

    const nAgeMonths = nAgeDays / 30.44;
    const pmaWeeks = parseFloat(gestWeeks) + (nAgeDays / 7);

    let assessment = {};

    if (isPreterm && pmaWeeks < 50) {
      const wRef = interpolate(pmaWeeks, DATA.fenton[gender].weight);
      const hRef = interpolate(pmaWeeks, DATA.fenton[gender].height);
      
      assessment = {
        mode: "Sinh non (Fenton)",
        ageLabel: `${pmaWeeks.toFixed(1)} tuần PMA`,
        isFenton: true,
        bmi: "-",
        wStatus: nWeight < wRef[1] ? "Bé cần tăng cân thêm" : nWeight > wRef[5] ? "Bé đang lớn khá nhanh" : "Cân nặng ổn định",
        hStatus: nHeight < hRef[1] ? "Cần cải thiện chiều dài" : "Chiều dài đạt chuẩn",
        wType: nWeight < wRef[1] ? "warning" : "success",
        hType: nHeight < hRef[1] ? "warning" : "success"
      };
    } else {
      let correctedAge = nAgeMonths;
      if (isPreterm && nAgeMonths <= 24) {
        correctedAge = nAgeMonths - (40 - gestWeeks) / 4;
      }
      
      if (correctedAge > 144) {
        assessment = {
          mode: "Ngoài phạm vi",
          ageLabel: `${(correctedAge/12).toFixed(1)} tuổi`,
          error: true,
          message: "Ứng dụng hiện hỗ trợ tốt nhất cho các bé dưới 12 tuổi."
        };
      } else {
        const bmi = parseFloat((nWeight / (nHeight / 100) ** 2).toFixed(1));
        const bmiRef = interpolate(Math.max(0, correctedAge), DATA.who[gender].bmi);
        const hRef = interpolate(Math.max(0, correctedAge), DATA.who[gender].height);

        const getBmiStatus = (v, r) => {
          if (v > r[5]) return { label: "Bé đang hơi thừa cân", color: "text-rose-600", bg: "bg-rose-50", type: "danger" };
          if (v > r[4]) return { label: "Cần chú ý vận động", color: "text-amber-600", bg: "bg-amber-50", type: "warning" };
          if (v < r[1]) return { label: "Bé hơi nhẹ cân", color: "text-blue-500", bg: "bg-blue-50", type: "warning" };
          return { label: "Cơ thể con rất cân đối", color: "text-emerald-600", bg: "bg-emerald-50", type: "success" };
        };

        assessment = {
          mode: "Chuẩn WHO",
          ageLabel: correctedAge < 24 ? `${correctedAge.toFixed(1)} tháng` : `${(correctedAge/12).toFixed(1)} tuổi`,
          isFenton: false,
          bmi: bmi,
          bmiStatus: getBmiStatus(bmi, bmiRef),
          hStatus: nHeight < hRef[1] ? "Cần cải thiện chiều cao" : "Chiều cao rất tốt",
          hColor: nHeight < hRef[1] ? "text-amber-600" : "text-emerald-600",
          hBg: nHeight < hRef[1] ? "bg-amber-50" : "bg-emerald-50"
        };
      }
    }

    setResult(assessment);
  };

  return (
    <div className={`min-h-screen ${theme.soft} p-4 md:p-8 flex justify-center items-start font-sans`}>
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className={`p-8 bg-gradient-to-br ${theme.gradient} text-white`}>
          <div className="flex items-center gap-3 mb-1">
            <Baby className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight uppercase">Kiểm tra Dinh dưỡng</h1>
          </div>
          <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Tiêu chuẩn Y khoa Quốc tế</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Gender Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => {setGender('boy'); setResult(null);}} 
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${gender === 'boy' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
            >
              Bé Trai
            </button>
            <button 
              onClick={() => {setGender('girl'); setResult(null);}} 
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${gender === 'girl' ? 'bg-white shadow text-rose-500' : 'text-gray-400'}`}
            >
              Bé Gái
            </button>
          </div>

          {!result ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              {/* Preterm Settings */}
              <div className={`p-4 rounded-2xl border ${isPreterm ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Timer className={`w-4 h-4 ${isPreterm ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-bold text-gray-700">Chế độ sinh non</span>
                  </div>
                  <button 
                    onClick={() => setIsPreterm(!isPreterm)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${isPreterm ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-all ${isPreterm ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                {isPreterm && (
                  <div className="mt-4 space-y-2 pt-2 border-t border-amber-100">
                    <div className="flex justify-between text-[11px] font-bold text-amber-700">
                      <span>TUẦN THAI:</span>
                      <span>{gestWeeks} tuần</span>
                    </div>
                    <input type="range" min="24" max="36" value={gestWeeks} onChange={e => setGestWeeks(e.target.value)} className="w-full h-1 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600" />
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div className="relative">
                  <input type="number" placeholder="Số tháng/tuổi" value={ageValue} onChange={e => setAgeValue(e.target.value)} className="w-full pl-4 pr-24 py-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                  <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                    {['days', 'months', 'years'].map(unit => (
                      <button key={unit} onClick={() => setAgeUnit(unit)} className={`px-2 rounded-lg text-[10px] font-bold ${ageUnit === unit ? `${theme.primary} text-white` : 'text-gray-400'}`}>
                        {unit === 'days' ? 'Ngày' : unit === 'months' ? 'Tháng' : 'Năm'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input type="number" placeholder="Cân nặng" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">KG</span>
                  </div>
                  <div className="relative">
                    <input type="number" placeholder="Chiều cao" value={height} onChange={e => setHeight(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">CM</span>
                  </div>
                </div>
              </div>

              <button onClick={calculate} disabled={!ageValue || !weight || !height} className={`w-full py-4 ${theme.primary} text-white rounded-xl font-bold shadow-lg shadow-blue-100 disabled:opacity-30 flex items-center justify-center gap-2`}>
                XEM KẾT QUẢ
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              {result.error ? (
                <div className="bg-amber-50 p-6 rounded-2xl text-center border border-amber-100">
                  <p className="text-sm text-amber-800 font-medium mb-4">{result.message}</p>
                  <button onClick={() => setResult(null)} className="text-xs font-bold text-amber-600 flex items-center gap-2 mx-auto"><RefreshCw className="w-3 h-3"/> Thử lại</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Result Card: Clean Design */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Cân nặng / BMI</p>
                      <p className={`text-sm font-bold ${result.isFenton ? (result.wType === 'success' ? 'text-emerald-600' : 'text-amber-600') : result.bmiStatus.color}`}>
                        {result.isFenton ? result.wStatus : `${result.bmiStatus.label} (${result.bmi})`}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Chiều cao</p>
                      <p className={`text-sm font-bold ${result.hColor}`}>{result.hStatus}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-600 rounded-2xl text-white flex justify-between items-center shadow-md">
                    <div>
                      <p className="text-[9px] font-bold opacity-70 uppercase">Mốc so sánh ({result.mode})</p>
                      <p className="text-lg font-bold">{result.ageLabel}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>

                  <button onClick={() => setResult(null)} className="w-full py-3 text-gray-400 font-bold text-xs flex items-center justify-center gap-2"><RefreshCw className="w-3 h-3"/> KIỂM TRA LẠI</button>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Info & CTA */}
          <div className="pt-2">
            <button 
              onClick={() => setShowDisclaimer(!showDisclaimer)}
              className="w-full py-4 px-5 flex items-center justify-between text-gray-600 rounded-2xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold">Lưu ý nho nhỏ từ Youmed</span>
              </div>
              {showDisclaimer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDisclaimer && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100 space-y-4">
<div className="space-y-3">
  <p className="text-xs text-slate-700 leading-relaxed">
    Kết quả trên <span className="font-semibold">chỉ mang tính chất tham khảo</span> và không thay thế tư vấn y khoa. 
    Để được <span className="font-semibold">chẩn đoán chính xác</span> và xây dựng chế độ dinh dưỡng phù hợp cho bé, 
    ba mẹ nên đặt lịch khám với bác sĩ trên{" "}
    <a 
      href="https://bit.ly/4bEwYl8" 
      target="_blank" 
      rel="noopener noreferrer nofollow"
      className="text-blue-600 font-bold underline cursor-pointer"
    >
      app YouMed
    </a>.
  </p>

  <a 
    href="https://bit.ly/4bEwYl8" 
    target="_blank" 
    rel="noopener noreferrer nofollow"
  >
    <button className="flex items-center gap-2 text-white bg-blue-600 px-5 py-3 rounded-xl shadow-lg shadow-blue-100 text-xs font-bold uppercase tracking-wider group transition-all hover:bg-blue-700">
      <CalendarPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      ĐẶT LỊCH KHÁM NGAY
    </button>
  </a>
</div>
                  
                  <div className="pt-4 border-t border-blue-100/60">
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      Ba mẹ không nên tự ý thay đổi chế độ dinh dưỡng, dùng sữa hoặc thực phẩm bổ sung khi chưa có tư vấn từ bác sĩ.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase px-1">Nguồn dữ liệu tham chiếu</p>
                  <div className="space-y-1">
                    <a href="https://www.who.int/tools/child-growth-standards/standards" target="_blank" rel="nofollow" className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] font-bold text-gray-600">Tiêu chuẩn WHO (Trẻ em thế giới)</span>
                      <ExternalLink className="w-3 h-3 text-gray-300" />
                    </a>
                    <div className="flex items-center p-3 bg-white border border-gray-100 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-400">Biểu đồ Fenton (Trẻ sinh non)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-50 text-center">
          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">Youmed - Kiểm tra dinh dưỡng & Tăng trưởng</p>
        </div>
      </div>
    </div>
  );
}