export default (response) => {
	/**
	* [
  {
    "inactiveNSGCount": 1,
    "activeNSGCount": 4,
    "alarmedNSGCount": {
      "critical": 0,
      "major": 4,
      "healthy": 0
    }
  }
]
	*/
	return (Array.isArray(response) && response.length && response[0].hasOwnProperty('alarmedNSGCount')) ?
		[
			{
				alarmType: 'Critical',
				count: response[0].alarmedNSGCount.critical
			},
			{
				alarmType: 'Major',
				count: response[0].alarmedNSGCount.major
			},
			{
				alarmType: 'Healthy',
				count: response[0].alarmedNSGCount.healthy
			}
		] : response;
}