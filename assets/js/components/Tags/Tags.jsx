import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { EOS_NEW_LABEL, EOS_DELETE } from 'eos-icons-react';

import Pill from '@components/Pill';

const Tags = ({ className, tags, onChange, onAdd, onRemove }) => {
  const [renderedTags, setTags] = useState(tags);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (addingTag) {
      inputRef.current.focus();
    }
  }, [addingTag]);

  return (
    <span className={classNames('flex', 'items-center', className)}>
      {renderedTags.map((tag, index) => (
        <Pill
          key={index}
          className={classNames({
            'ml-2': index !== 0,
            group: true,
            flex: true,
            'items-center': true,
          })}
        >
          {tag}
          <span
            className="hidden ml-2 cursor-pointer group-hover:inline"
            onClick={() => {
              const newTagsList = renderedTags.reduce(
                (acc, current) => (current === tag ? acc : [...acc, current]),
                []
              );
              const deletedTag = renderedTags.find((t) => t === tag);
              setTags(newTagsList);
              onChange(newTagsList);
              onRemove(deletedTag);
            }}
          >
            <EOS_DELETE color="#276749" size="base" />
          </span>
        </Pill>
      ))}
      {addingTag ? (
        <Pill className="ml-2">
          <input
            ref={inputRef}
            className="bg-green-100"
            onChange={({ target: { value } }) => {
              setNewTagValue(value);
            }}
            onKeyDown={({ key }) => {
              if (key === 'Enter') {
                if (newTagValue !== '' && !renderedTags.includes(newTagValue)) {
                  renderedTags.push(newTagValue);
                }
                setAddingTag(false);
                setNewTagValue('');
                onChange(renderedTags);
                onAdd(newTagValue);
              }
            }}
            value={newTagValue}
          />
        </Pill>
      ) : (
        <Pill
          className={classNames({
            'ml-2': renderedTags.length !== 0,
            flex: true,
            'items-center': true,
            'cursor-pointer': true,
          })}
          onClick={() => setAddingTag(true)}
        >
          <EOS_NEW_LABEL color="#276749" size="base" /> Add Tag
        </Pill>
      )}
    </span>
  );
};

export default Tags;
