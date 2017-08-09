const greenRoundedStyle = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
    zIndex: '9999',
    color: '#555',
    cursor: 'pointer !important',
  },
  tooltip: {
    position: 'absolute',
    zIndex: '9999',
    background: '#000',
    bottom: '100%',
    left: '40%',
    marginBottom: '10px',
    padding: '5px',
    WebkitTransform: 'translateX(-50%)',
    msTransform: 'translateX(-50%)',
    OTransform: 'translateX(-50%)',
    transform: 'translateX(-50%)',
  },
  content: {
    background: '#000',
    color: '#fff',
    fontSize: '1em',
    padding: '.3em 1em',
    whiteSpace: 'nowrap',
  },
}

export default greenRoundedStyle;