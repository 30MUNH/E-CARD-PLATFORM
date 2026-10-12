import React from 'react';
import { CalendarHeart, Heart, Sparkles } from 'lucide-react';
import { EcardPreloadData, SpecialDateMilestone } from '../data/ecardData';
import { FloatingNavButtons } from './FloatingNavButtons';

interface TimelineViewProps {
  preloadedData: EcardPreloadData;
  onBack: () => void;
  onNext: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  preloadedData,
  onBack,
  onNext,
}) => {
  const milestones: SpecialDateMilestone[] =
    preloadedData.specialDates && preloadedData.specialDates.length > 0
      ? preloadedData.specialDates
      : [
          {
            id: 'default-1',
            date: preloadedData.ecardData.love_start_date.slice(0, 10),
            title: 'Ngày bắt đầu yêu nhau',
            description: 'Khoảnh khắc mở đầu cho hành trình yêu thương của hai đứa mình.',
            badge: 'Khởi đầu',
          },
        ];

  return (
    <div className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 text-[#A33149] max-h-[82vh] overflow-y-auto">
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 shadow-sm text-xs md:text-sm font-semibold text-[#8c5261] mb-2">
          <Sparkles className="w-4 h-4 text-[#A33149]" />
          <span>Hành trình yêu thương</span>
        </div>
        <h2
          className="text-2xl md:text-3xl lg:text-4xl text-[#A33149]"
          style={{ fontFamily: 'Pacifico, cursive', fontWeight: 400 }}
        >
          Những Cột Mốc Đáng Nhớ
        </h2>
      </div>

      <div className="relative space-y-4 md:space-y-6 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-5 md:before:left-1/2 before:w-0.5 before:bg-[#A33149]/30">
        {milestones.map((item, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={item.id || idx}
              className={`relative flex items-start md:items-center gap-4 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className="hidden md:block md:w-1/2" />
              <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[#A33149] text-white shadow-md shrink-0">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="flex-1 md:w-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-md border border-rose-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c5261]">
                    <CalendarHeart className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-[#A33149]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#A33149] mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <FloatingNavButtons
        onBack={onBack}
        onNext={onNext}
        bottomOffsetClass="bottom-[5vh]"
      />
    </div>
  );
};
