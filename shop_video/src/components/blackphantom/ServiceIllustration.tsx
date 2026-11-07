import React from "react";
import { Easing, interpolate } from "remotion";

type ServiceId = "web" | "automation" | "commerce" | "software";
const ease = Easing.out(Easing.cubic);
const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
const GOLD = "#C8A66A";
const WHITE = "#F1F2F4";
const MUTED = "#B6BEC8";

const Panel: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ x, y, w, h, children }) => <g>
  <rect x={x} y={y} width={w} height={h} rx={16} fill="#151B22" stroke="#50545A" strokeWidth={1.5} />
  <path d={`M${x+18} ${y+1} H${x+w-18}`} stroke={GOLD} strokeOpacity={0.35} />
  {children}
</g>;

const Text: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; color?: string }> = ({ x, y, children, size = 23, color = WHITE }) => <text x={x} y={y} fill={color} fontFamily="Manrope, sans-serif" fontWeight={700} fontSize={size}>{children}</text>;

const Web: React.FC<{ f: number }> = ({ f }) => {
  const reveal = p(f, 5, 28);
  const cards = p(f, 38, 72);
  return <g opacity={reveal}>
    <Panel x={65} y={72} w={690} h={530}>
      <rect x={65} y={72} width={690} height={55} rx={16} fill="#252B33" />
      {[0,1,2].map(i => <circle key={i} cx={94+i*20} cy={100} r={5} fill={i === 0 ? GOLD : MUTED} opacity={0.6} />)}
      <Text x={110} y={205} size={42}>Ваш бизнес онлайн</Text>
      <Text x={110} y={250} size={22} color={MUTED}>Современный сайт для ваших клиентов</Text>
      <rect x={110} y={285} width={215} height={53} rx={8} fill={GOLD}/>
      <Text x={145} y={320} size={20} color="#11151B">Подробнее</Text>
      {[0,1,2].map(i => <g key={i} opacity={cards}>
        <rect x={110+i*180} y={400} width={150} height={125} rx={10} fill="#29323A" stroke="#65645E" />
        <rect x={130+i*180} y={423} width={110} height={48} rx={5} fill={i === 1 ? GOLD : "#545D63"} />
        <rect x={130+i*180} y={493} width={90} height={6} rx={3} fill={MUTED} />
      </g>)}
    </Panel>
  </g>;
};

const Automation: React.FC<{ f: number }> = ({ f }) => {
  const steps = [{x:75,label:"Обращение"},{x:315,label:"AI-ассистент"},{x:560,label:"Готовый ответ"}];
  return <g>
    <Panel x={43} y={110} w={735} h={450}>
      {steps.map((s,i) => <g key={i} opacity={p(f,8+i*16,28+i*16)}>
        <rect x={s.x} y={270} width={190} height={110} rx={14} fill="#252C33" stroke={GOLD} strokeOpacity={0.6} />
        <Text x={s.x+18} y={330} size={i === 1 ? 21 : 22}>{s.label}</Text>
      </g>)}
      {[0,1].map(i => {
        const start = 27+i*22; const q = p(f,start,start+18); const x1 = i === 0 ? 265 : 505; const x2 = i === 0 ? 315 : 560;
        return <g key={i}>
          <path d={`M${x1} 325 H${x2}`} stroke={GOLD} strokeWidth={3} strokeOpacity={0.5} />
          <circle cx={x1+(x2-x1)*q} cy={325} r={7} fill={WHITE} opacity={p(f,start,start+5)} />
        </g>;
      })}
    </Panel>
  </g>;
};

const Commerce: React.FC<{ f: number }> = ({ f }) => {
  const selected = p(f,30,56); const complete = p(f,62,88);
  return <g>
    <Panel x={80} y={68} w={660} h={540}>
      <Text x={125} y={128} size={30}>Интернет-магазин</Text>
      <rect x={125} y={163} width={360} height={255} rx={12} fill="#29313A" />
      <g transform={`translate(${selected*12},${-selected*8})`}>
        <rect x={220} y={204} width={150} height={165} rx={18} fill="#AFA89A" />
        <rect x={242} y={226} width={106} height={120} rx={12} fill="#D2C6B2" />
      </g>
      <Text x={125} y={467} size={26}>Товар в каталоге</Text>
      <rect x={125} y={496} width={210} height={58} rx={9} fill={GOLD} />
      <Text x={155} y={532} size={22} color="#11151B">В корзину</Text>
      <g opacity={complete}>
        <rect x={510} y={250} width={205} height={155} rx={12} fill="#232E30" stroke={GOLD} />
        <Text x={530} y={307} size={22}>Заказ принят</Text>
        <Text x={530} y={350} size={32} color={GOLD}>✓</Text>
      </g>
    </Panel>
  </g>;
};

const Software: React.FC<{ f: number }> = ({ f }) => {
  const modules = [{x:95,y:130,t:"Платформа"},{x:430,y:130,t:"Интеграции"},{x:95,y:400,t:"Данные"},{x:430,y:400,t:"Управление"}];
  return <g>
    {modules.map((m,i)=> <g key={i} opacity={p(f,8+i*12,28+i*12)} transform={`translate(0,${(1-p(f,8+i*12,28+i*12))*20})`}>
      <Panel x={m.x} y={m.y} w={275} h={145}>
        <Text x={m.x+24} y={m.y+75} size={27}>{m.t}</Text>
        <rect x={m.x+24} y={m.y+102} width={165} height={4} rx={2} fill={GOLD} opacity={0.65} />
      </Panel>
    </g>)}
    <g opacity={p(f,45,74)}>
      <path d="M370 202 H430 M370 472 H430 M232 275 V400 M567 275 V400" fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="7 9" />
      <circle cx={400} cy={337} r={32} fill="#171D23" stroke={GOLD} strokeWidth={2} />
      <Text x={386} y={346} size={25} color={GOLD}>✓</Text>
    </g>
  </g>;
};

export const ServiceIllustration: React.FC<{ id: ServiceId; frame: number }> = ({ id, frame }) => <svg viewBox="0 0 820 680" width="820" height="680" style={{ display: "block", overflow: "hidden" }}>
  <defs><radialGradient id="serviceLight"><stop stopColor={GOLD} stopOpacity={0.13}/><stop offset={1} stopColor={GOLD} stopOpacity={0}/></radialGradient></defs>
  <ellipse cx={410} cy={340} rx={390} ry={300} fill="url(#serviceLight)" />
  {id === "web" && <Web f={frame}/>}
  {id === "automation" && <Automation f={frame}/>}
  {id === "commerce" && <Commerce f={frame}/>}
  {id === "software" && <Software f={frame}/>}
</svg>;
