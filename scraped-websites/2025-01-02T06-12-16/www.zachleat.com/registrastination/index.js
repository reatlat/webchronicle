(function($)
{
	var NO_REGISTRATION = 'NONE';
	
	var dates = {
		'AL': 'October 24, 2008',  
		'AK': 'October 5, 2008',  
		'AZ': 'October 6, 2008',  
		'AR': 'October 6, 2008',
		'CA': 'October 20, 2008',
		'CO': 'October 6, 2008',
		'CT': 'October 21, 2008',
		'DE': 'October 11, 2008',
		'DC': 'October 6, 2008',
		'FL': 'October 6, 2008',
		'GA': 'October 6, 2008',
		'HI': 'October 6, 2008',
		'ID': 'November 4, 2008',  
		'IL': 'October 7, 2008',  
		'IN': 'October 6, 2008',
		'IA': 'October 24, 2008',  
		'KS': 'October 20, 2008',  
		'KY': 'October 6, 2008',  
		'LA': 'October 6, 2008',  
		'ME': 'October 21, 2008',  
		'MD': 'October 14, 2008',  
		'MA': 'October 15, 2008',  
		'MI': 'October 6, 2008',  
		'MN': 'November 4, 2008',  
		'MS': 'October 6, 2008',  
		'MO': 'October 8, 2008',  
		'MT': 'November 4, 2008',
		'NE': 'October 24, 2008',
		'NV': 'October 14, 2008',
		'NH': 'November 4, 2008',
		'NJ': 'October 14, 2008',
		'NM': 'October 7, 2008',
		'NY': 'October 10, 2008',
		'NC': 'October 10, 2008',
		'ND': NO_REGISTRATION,
		'OH': 'October 6, 2008',  
		'OK': 'October 10, 2008',  
		'OR': 'October 14, 2008',  
		'PA': 'October 6, 2008',  
		'RI': 'October 4, 2008',  
		'SC': 'October 4, 2008',  
		'SD': 'October 20, 2008',
		'TN': 'October 6, 2008',  
		'TX': 'October 6, 2008',  
		'UT': 'October 28, 2008',  
		'VT': 'October 29, 2008',  
		'VA': 'October 6, 2008',  
		'WA': 'October 20, 2008',  
	  	'WV': 'October 15, 2008',  
	  	'WI': 'November 4, 2008',
		'WY': 'November 4, 2008'
	};
	
	var byMailDates = {
		'AK': 'October 4, 2008', 
		'MT': 'October 6, 2008',
		'NE': 'October 17, 2008',
		'UT': 'October 6, 2008',
		'WA': 'October 4, 2008',
		'WI': 'October 15, 2008'
	};

	function getDate(str, hideDiff)
	{
		return '<span class="date">' + str + '</span>' +
			(!hideDiff ? '<div>You have <span class="dateDiff" title="' + objToIso8601(new Date(str)) + '">' + str + '</span></div>' : '');
	}

	function pad(str)
	{
		var num = parseInt(str,10);
		return num < 10 ? '0' + num : num;
	}

	function objToIso8601(obj)
    {
        if(!obj) obj = new Date();
        return obj.getFullYear()
            + '-' + pad(obj.getUTCMonth()+1)
            + '-' + pad(obj.getUTCDate())
            + 'T' + pad(obj.getUTCHours())
            + ':' + pad(obj.getUTCMinutes())
            + ':' + pad(obj.getUTCSeconds())
            + 'Z';
    }

	$(function()
	{
		$('#state').change(function()
		{
			var val = $(this).val(),
				s = [],
				byMail = byMailDates[val];

			if(val) {
				if(dates[val] == NO_REGISTRATION) {
					s.push('<div>No registration required to vote.</div>');
				} else {
					s.push('<div>' + getDate(dates[val]) + '</div>');
					if(byMail) {
						s.push('<div class="postmarked">Must be postmarked by ' + getDate(byMail, true) + '</div>');
					}
				}
			}

			$('#countdown').html(s.join(' '));
			$('.dateDiff').humane_dates();
		}).val(geoip_region()).change();
	});
})(jQuery);