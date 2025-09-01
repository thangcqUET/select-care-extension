import React from 'react';

interface TextWithLineBreaksProps {
  text: string;
}

const TextWithLineBreaks: React.FC<TextWithLineBreaksProps> = ({ text }) => {
  // Split text by line breaks and render each line
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

export default TextWithLineBreaks;
