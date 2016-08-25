import lightMuiTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export const lightTheme = getMuiTheme(lightMuiTheme, {
  palette: {
    primary1Color: '#34699b',
    primary2Color: '#83a8cd',
    primary3Color: '#3b5874',
    thinBorder: 'solid 1px',
    boldBorder: 'solid 2px',
    smallBorderRadius: '2px',
  }
});

export const theme = lightTheme;
