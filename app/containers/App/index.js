import React from "react";
import { connect } from "react-redux";
import BigCalendar from "react-big-calendar";
import moment from "moment";
import ReactModal from "react-modal";
import PropTypes from "prop-types";
import {
  getMonthCalendar,
  getFilterEventType
} from "../../redux/action/calendar";
import "./app.scss";
import Calendar from "../Calendar";
import ModalEventDetail from "../ModalEventDetail";
import ModalSettings from "../ModalSettings";
import iconSettings from "../../assets/images/settings.png";
import SelectFilter from "../SelectFilter";

const localizer = BigCalendar.momentLocalizer(moment);

const mapStateToProps = ({ calendar }) => ({
  calendar
});
const mapDispatchToProps = dispatch => ({
  getMonthCalendar: (year, month) => dispatch(getMonthCalendar(year, month)),
  getFilterEventType: () => dispatch(getFilterEventType())
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      yearEvents: new Date().getFullYear(),
      monthEvents: new Date().getMonth(),
      isOpen: false,
      idEvent: 0,
      skins: "indigo",
      isOpenSettings: false,
      typesEvent: {}
    };
    this.filterEvents = [];
    this.searchEventDetail = {};
  }

  componentDidMount() {
    this.props.getMonthCalendar(this.state.yearEvents, this.state.monthEvents);
    this.props.getFilterEventType();
  }

  onSelectEvents = a => {
    this.setState({ isOpen: !this.state.isOpen, idEvent: a.id });
  };

  getOnNavigate = date => {
    const nextYear = date.getFullYear();
    const nextMonth = date.getMonth();
    if (this.state.yearEvents === nextYear) {
      if (this.state.monthEvents !== nextMonth) {
        this.props.getMonthCalendar(this.state.yearEvents, nextMonth);
        this.setState({ monthEvents: nextMonth });
      }
    } else {
      this.props.getMonthCalendar(nextYear, nextMonth);
      this.setState({ yearEvents: nextYear, monthEvents: nextMonth });
    }
  };

  filterMonthEvents = events => {
    const convertEvents = [];
    const hashMapEvents = {};
    const regExp = /\(([^)]+)\)/;
    events.forEach(item => {
      const convertEvent = {
        title: item.eventName,
        id: item.eventId,
        desc: item.description,
        start: new Date(Number(regExp.exec(item.startDate)[1])),
        end: new Date(Number(regExp.exec(item.endDate)[1])),
        colorEvent: item.eventColor,
        eventTypeId: item.eventTypeId
      };
      convertEvents.push(convertEvent);
      hashMapEvents[item.eventId] = item;
    });
    this.searchEventDetail = hashMapEvents;
    this.filterEvents = convertEvents;
  };
  isOpenModal = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
  changeColor = color => {
    this.setState({ skins: color });
  };
  isOpenSettings = () => {
    this.setState({ isOpenSettings: !this.state.isOpenSettings });
  };
  filterTypeSelect = typesEvent => {
    this.setState({ typesEvent });
  };
  filterTypes = () => {
    this.filterEvents = this.filterEvents.filter(
      item => this.state.typesEvent[item.eventTypeId] !== undefined
    );
  };
  render() {
    if (this.props.calendar.eventForMonth.length > 0) {
      this.filterMonthEvents(this.props.calendar.eventForMonth);
    }
    if (Object.keys(this.state.typesEvent).length > 0) {
      this.filterTypes();
    }
    return (
      <div className={`app-wrapper app-wrapper_${this.state.skins}`}>
        <div>
          <SelectFilter
            filterTypeSelect={this.filterTypeSelect}
            calendar={this.props.calendar}
          />
        </div>
        <Calendar
          events={this.filterEvents}
          onNavigate={this.getOnNavigate}
          localizer={localizer}
          onSelectEvent={this.onSelectEvents}
        />
        <span
          className={`app-wrapper-settings ${
            this.state.isOpenSettings ? "settings_active" : ""
          }`}
          onClick={this.isOpenSettings}
        >
          <img
            className="app-wrapper-settings-img"
            src={iconSettings}
            alt="Settings"
          />
        </span>
        <ReactModal
          ariaHideApp={false}
          closeTimeoutMS={500}
          isOpen={this.state.isOpenSettings}
          className="ModalSettings"
          shouldCloseOnOverlayClick
          onRequestClose={this.isOpenSettings}
        >
          <ModalSettings
            skins={this.state.skins}
            changeColor={this.changeColor}
          />
        </ReactModal>
        <ReactModal
          ariaHideApp={false}
          isOpen={this.state.isOpen}
          className="Modal"
          shouldCloseOnOverlayClick
          onRequestClose={this.isOpenModal}
        >
          <ModalEventDetail
            eventDetail={this.searchEventDetail[this.state.idEvent]}
            skinsColor={this.state.skins}
          />
        </ReactModal>
      </div>
    );
  }
}
App.propTypes = {
  getMonthCalendar: PropTypes.func.isRequired,
  calendar: PropTypes.shape({
    eventForMonth: PropTypes.array.isRequired
  }).isRequired
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
