/* eslint no-console: 0 */
/* eslint react/jsx-props-no-spreading: 0 */
import React from 'react';

const withAnimationFrame = (WrappedComponent) => {
  class HOC extends React.Component {
    constructor(props) {
      super(props);

      this.requestNextFrame = this.requestNextFrame.bind(this);
      this.setAnimationFrameCallback = this.setAnimationFrameCallback.bind(this);
      this.rafId = 0;
    }

    componentWillUnmount() {
      cancelAnimationFrame(this.rafId);
    }

    setAnimationFrameCallback(callback) {
      this.onAnimationFrame = callback;
      this.rafId = requestAnimationFrame(this.requestNextFrame);
    }

    requestNextFrame(time) {
      this.onAnimationFrame(time);
      this.rafId = requestAnimationFrame(this.requestNextFrame);
    }

    render() {
      return (
        <>
          <WrappedComponent
            {...this.props}
            setAnimationFrameCallback={this.setAnimationFrameCallback}
          />
        </>
      );
    }
  }

  return HOC;
};

export default withAnimationFrame;
