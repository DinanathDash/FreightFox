import { Component } from 'react';
import ErrorPage from '../../Pages/Error/ErrorPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the error to console (could be extended to log to a service)
    console.error("Error caught by error boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Display ErrorPage with custom message based on the error
      return (
        <ErrorPage 
          statusCode={500}
          message={this.state.error?.message || "Something went wrong in the application"} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
