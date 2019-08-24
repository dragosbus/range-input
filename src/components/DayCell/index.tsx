/* eslint-disable no-fallthrough */
import React, { Component } from 'react';
import classnames from 'classnames';
import { startOfDay, format, isSameDay, isAfter, isBefore, endOfDay } from 'date-fns';
import './style.css'

type HandleMouseEvent = React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FocusEvent<HTMLButtonElement>

export enum DisplayMode {
  DateRange = 'dateRange',
  Date = 'date'
}

export interface Ranges {
  startDate: Date | null,
  endDate: Date | null,
  key:string,
  autoFocus: boolean,
  disabled:boolean,
  showDateDisplay: boolean,
}

interface Props {
  ranges:Ranges[]
  date:any
  disabled:boolean
  day:any
  preview:{
    startDate:Date | null
    endDate:Date | null
    color:string
  }
  isPassive: boolean
  isToday: boolean
  isWeekend: boolean
  isStartOfWeek: boolean
  isEndOfWeek: boolean
  isStartOfMonth: boolean
  isEndOfMonth: boolean
  styles:any
  color:string
  displayMode:DisplayMode.DateRange | DisplayMode.Date
  onMouseDown(day:any):any
  onMouseUp(day:any):any
  onPreviewChange(day?:any):any
  onMouseEnter(day:any):any
}

interface State {
  hover:boolean
  active:boolean
  stateChanges:{
    hover:boolean
    active:boolean
  }
}

class DayCell extends Component<Props,State> {

  state = {
    hover: false,
    active: false,
    stateChanges:{
      hover:false,
      active:false
    }
  }

  handleKeyEvent = (event:React.KeyboardEvent<HTMLButtonElement>) => {
    const { day } = this.props;
    switch (event.keyCode) {
      case 13: //space
      case 32: //enter
        if (event.type === 'keydown') {
          this.props.onMouseDown(day);
        } else {
          this.props.onMouseUp(day);
        }
        break;
    }
  }

  handleMouseEvent = (event:HandleMouseEvent) => {
    const { day, disabled, onPreviewChange } = this.props;
    const {stateChanges} = this.state;
    if (disabled) {
      onPreviewChange();
      return;
    }

    switch (event.type) {
      case 'mouseenter':
        this.props.onMouseEnter(day);
        onPreviewChange(day);
        stateChanges.hover = true;
        break;
      case 'blur':
      case 'mouseleave':
        stateChanges.hover = false;
        break;
      case 'mousedown':
        stateChanges.active = true;
        this.props.onMouseDown(day);
        break;
      case 'mouseup':
        event.stopPropagation();
        stateChanges.active = false;
        this.props.onMouseUp(day)
        break;
      case 'focus':
        onPreviewChange(day)
        break;
    }
    if (Object.keys(stateChanges).length) {
      this.setState(stateChanges)
    }
  }

  getClassNames = () => {
    const {
      isPassive,
      isToday,
      isWeekend,
      isStartOfWeek,
      isEndOfWeek,
      isStartOfMonth,
      isEndOfMonth,
      disabled,
      styles,
    } = this.props

    return classnames(styles.day, {
      [styles.dayPassive]: isPassive,
      [styles.dayDisabled]: disabled,
      [styles.dayToday]: isToday,
      [styles.dayWeekend]: isWeekend,
      [styles.dayStartOfWeek]: isStartOfWeek,
      [styles.dayEndOfWeek]: isEndOfWeek,
      [styles.dayStartOfMonth]: isStartOfMonth,
      [styles.dayEndOfMonth]: isEndOfMonth,
      [styles.dayHovered]: this.state.hover,
      [styles.dayActive]: this.state.active,
    })
  }

  renderPreviewPlaceholder = () => {
    const { preview, day, styles } = this.props
    if (!preview) return null
    const startDate = preview.startDate ? endOfDay(preview.startDate) : null
    const endDate = preview.endDate ? startOfDay(preview.endDate) : null
    const isInRange =
      (!startDate || isAfter(day, startDate)) && (!endDate || isBefore(day, endDate))
    const isStartEdge = !isInRange && isSameDay(day, startDate || 0)
    const isEndEdge = !isInRange && isSameDay(day, endDate || 0)
    return (
      <span
        className={classnames({
          [styles.dayStartPreview]: isStartEdge,
          [styles.dayInPreview]: isInRange,
          [styles.dayEndPreview]: isEndEdge,
        })}
        style={{ color: preview.color }}
      />
    );
  }

  renderSelectionPlaceholders = () => {
    const { styles, ranges, day,displayMode,date,color } = this.props
    if (displayMode === 'date') {
      let isSelected = isSameDay(day, date);
      return isSelected ? (
        <span className={styles.selected} style={{ color: color }} />
      ) : null;
    }

    const inRanges = ranges.reduce((result:any, range) => {
      let startDate = range.startDate;
      let endDate = range.endDate;
      if (startDate && endDate && isBefore(endDate, startDate)) {
        [startDate, endDate] = [endDate, startDate];
      }
      startDate = startDate ? endOfDay(startDate) : null;
      endDate = endDate ? startOfDay(endDate) : null;
      const isInRange =
        (!startDate || isAfter(day, startDate)) && (!endDate || isBefore(day, endDate));
      const isStartEdge = !isInRange && isSameDay(day, startDate || 0);
      const isEndEdge = !isInRange && isSameDay(day, endDate || 0);
      if (isInRange || isStartEdge || isEndEdge) {
        return [
          ...result,
          {
            isStartEdge,
            isEndEdge: isEndEdge,
            isInRange,
            ...range,
          },
        ];
      }
      return result;
    }, []);

    return inRanges.map((range:any, i:number) => (
      <span
        key={i}
        className={classnames({
          [styles.startEdge]: range.isStartEdge,
          [styles.endEdge]: range.isEndEdge,
          [styles.inRange]: range.isInRange,
        })}
        style={{ color: range.color || this.props.color }}
      />
    ));
  }
  render() {
    const { styles } = this.props;
    return (
      <button
        type="button"
        onMouseEnter={this.handleMouseEvent}
        onMouseLeave={this.handleMouseEvent}
        onFocus={this.handleMouseEvent}
        onMouseDown={this.handleMouseEvent}
        onMouseUp={this.handleMouseEvent}
        onBlur={this.handleMouseEvent}
        onPauseCapture={this.handleMouseEvent}
        onKeyDown={this.handleKeyEvent}
        onKeyUp={this.handleKeyEvent}
        className={this.getClassNames()}
        {...(this.props.disabled || this.props.isPassive ? { tabIndex: -1 } : {})}
        style={{ color: this.props.color }}>
        {this.renderSelectionPlaceholders()}
        {this.renderPreviewPlaceholder()}
        <span className={styles.dayNumber}>
          <span>{format(this.props.day, 'D')}</span>
        </span>
      </button>
    );
  }
}

export default DayCell;