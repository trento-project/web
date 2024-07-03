import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { EOS_NEW_LABEL, EOS_CLOSE } from 'eos-icons-react';
import Pill from '@common/Pill';
import Tooltip from '@common/Tooltip';
import DisabledGuard from '@common/DisabledGuard';
import useOnClickOutside from '@hooks/useOnClickOutside';
// eslint-disable-next-line
const tagRegexValidation = /^[\+\-=.,_:@\p{L}\w]*$/u;
const tagValidation = (char) => tagRegexValidation.test(char);
const tagValidationDefaultMessage = (
  <>
    Only alphanumeric characters
    <br />
    are allowed, e.g. A-Z and 0-9
  </>
);

function ExistingTag({ onClick, disabled }) {
  return (
    <span
      aria-hidden="true"
      className={classNames('cursor-pointer group-hover:opacity-60', {
        'opacity-50 pointer-events-none': disabled,
      })}
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
    >
      <EOS_CLOSE className="ml-2" color="#276749" size="base" />
    </span>
  );
}

function Tags({
  className,
  tags,
  onChange,
  onAdd,
  onRemove,
  resourceId,
  userAbilities,
  tagAdditionPermittedFor = [],
  tagDeletionPermittedFor = [],
  validationMessage = tagValidationDefaultMessage,
}) {
  const [renderedTags, setTags] = useState(tags);
  const [addingTag, setAddingTag] = useState(false);
  const [showValidationTooltip, setShowValidationTooltip] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (addingTag) {
      inputRef.current.focus();
    }
  }, [addingTag]);

  useEffect(() => {
    setTags(tags);
  }, [tags]);

  useOnClickOutside(inputRef, () => {
    setAddingTag(false);
    setShowValidationTooltip(false);
  });

  return (
    <span
      className={classNames(
        'flex',
        'items-center',
        'flex-wrap',
        'gap-y-2',
        'gap-x-1.5',
        className
      )}
    >
      {renderedTags.map((tag) => (
        <Pill
          key={`${tag}-${resourceId}`}
          className={classNames({
            'text-green-800': true,
            'bg-green-100': true,
            group: true,
            flex: true,
            'items-center': true,
            'hover:scale-110': true,
            transition: true,
            'ease-in-out': true,
            'delay-50': true,
          })}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {tag}
          <DisabledGuard
            userAbilities={userAbilities}
            permitted={tagDeletionPermittedFor}
            tooltipWrap
          >
            <ExistingTag
              onClick={() => {
                const newTagsList = renderedTags.reduce(
                  (acc, current) => (current === tag ? acc : [...acc, current]),
                  []
                );
                setTags(newTagsList);
                onChange(newTagsList);
                onRemove(tag);
              }}
            />
          </DisabledGuard>
        </Pill>
      ))}
      {addingTag ? (
        <Tooltip content={validationMessage} visible={showValidationTooltip}>
          <Pill className="ml-2 bg-green-100 text-green-800 animate-fade">
            <input
              ref={inputRef}
              className="bg-green-100"
              onChange={({ target: { value } }) => {
                const isValid = tagValidation(value);
                setShowValidationTooltip(!isValid);
                isValid && setNewTagValue(value);
              }}
              onKeyDown={({ key }) => {
                if (key === 'Enter') {
                  if (
                    newTagValue.length === 0 ||
                    renderedTags.includes(newTagValue)
                  ) {
                    return;
                  }
                  renderedTags.push(newTagValue);
                  setAddingTag(false);
                  setNewTagValue('');
                  onChange(renderedTags);
                  onAdd(newTagValue);
                }
              }}
              value={newTagValue}
            />
          </Pill>
        </Tooltip>
      ) : (
        <DisabledGuard
          userAbilities={userAbilities}
          permitted={tagAdditionPermittedFor}
          tooltipWrap
        >
          <Pill
            className={classNames({
              'text-green-800': true,
              'bg-green-100': true,
              flex: true,
              'items-center': true,
              'cursor-pointer': true,
              'hover:scale-110': true,
              transition: true,
              'ease-in-out': true,
              'delay-50': true,
            })}
            onClick={(e) => {
              e.stopPropagation();
              setAddingTag(true);
            }}
          >
            <EOS_NEW_LABEL color="#276749" size="base" /> Add Tag
          </Pill>
        </DisabledGuard>
      )}
    </span>
  );
}

export default Tags;
