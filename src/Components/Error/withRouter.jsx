import { useNavigate, useLocation, useParams } from 'react-router-dom';

// This is a higher-order component that wraps class components
// to give them access to the router hooks
export function withRouter(Component) {
  function ComponentWithRouterProps(props) {
    let navigate = useNavigate();
    let location = useLocation();
    let params = useParams();
    
    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProps;
}
