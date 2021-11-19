const prettifyLabel = label =>
  label
    .trim()
    .replace(/(^|_)[a-zA-Z]/gi, letter => letter.toUpperCase())
    .replace(/_/g, ' ');

const formatIndent = layers => `${[...Array(layers)].join('    ')}`;

export const prettifyLog = target => {
  const prettifyChunk = (chunk, indent = 1) =>
    Object.keys(chunk)
      .map(key => {
        const labelPrettified = prettifyLabel(key);

        if (typeof chunk[key] === 'undefined' || chunk[key] === null || chunk[key] === '') {
          return `${formatIndent(indent)}${labelPrettified}: -`;
        }

        if (typeof chunk[key] !== 'object' || Array.isArray(chunk[key])) {
          return `${formatIndent(indent)}${labelPrettified}: ${chunk[key]}`;
        }

        return `${formatIndent(indent)}${labelPrettified}:\n` + prettifyChunk(chunk[key], ++indent);
      })
      .join('\n');

  return prettifyChunk(target);
};
