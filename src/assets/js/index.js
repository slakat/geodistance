/* eslint-disable no-undef */
/* eslint-disable  no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable func-names */
import './assets';
import '../styles/layout.scss';

// eslint-disable-next-line no-console
console.log('App is running :)');

/*
*  @fn getSuggestions()
* @Description get suggestions from db starting from the sixth character in input. Used in /index.
* @param {string} input Term we're looking for so far.
* @param {object} datalist Specific object datalist to change its options after the call response
*/
function getSuggestions(input, datalist) {
  if (input.length >= 6) {
    $.ajax({
      dataType: 'json',
      type: 'POST',
      async: true,
      url: '/locations/suggestions',
      data: { hint: input },
      success(data) {
        $(datalist).empty();
        for (let i = 0; i < data.results.length; i++) {
          $(datalist).append(`<option value="${data.results[i].address}"></option>`);
        }
      },
    });
  }
}

$(document).on('input', '*[name=origin]', function (e) {
  const input = $(this).val();
  getSuggestions(input, '#originDatalistOptions');
});
$(document).on('input', '*[name=destination]', function (e) {
  const input = $(this).val();
  getSuggestions(input, '#destinationDatalistOptions');
});
