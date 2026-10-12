import React, { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  letters: string[];
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ letters }) => {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const charIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentLineIndex >= letters.length) return;
    const fullLine = letters[currentLineIndex];

    const step = () => {
      setCurrentText(fullLine.slice(0, charIndexRef.current + 1));
      charIndexRef.current += 1;
      if (charIndexRef.current < fullLine.length) {
        timerRef.current = setTimeout(step, 40);
      } else {
        setCompletedLines((prev) => [...prev, fullLine]);
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentText('');
        charIndexRef.current = 0;
      }
    };

    timerRef.current = setTimeout(step, 40);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentLineIndex, letters]);

  return (
    <>
      {completedLines.map((line, idx) => (
        <p key={idx} style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}>
          {line}
        </p>
      ))}
      {currentLineIndex < letters.length && (
        <p style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}>{currentText}</p>
      )}
    </>
  );
};
