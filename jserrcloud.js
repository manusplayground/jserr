(function(window) {

	if (window.jsErrCloud) return;

  window.jsErrCloud = {};

	window.onerror = function onerror (messageOrEvent, url, lineNo, charNo, error) {
		// Ignore errors with no info due to CORS settings
      if (lineNo === 0 && /Script error\.?/.test(messageOrEvent)) {
				// do nothing
      } else {
				if (error) {
          // if the last parameter (error) was supplied, this is a modern browser's
          // way of saying "this value was thrown and not caught"
          if (error.name && error.message) {
            // if it looks like an error, construct a report object using its stack
            report = {
              "name": error.name,
              "error_message": error.message,
              "stack": jsErrCloud.decorateStack(jsErrCloud.getStacktrace(error), url, lineNo, charNo),
              "state": { severity: 'error', unhandled: true, severityReason: { type: 'unhandledException' } }
            }

						console.log("error caught by jserr cloud", report);
          }
				}
  		}
		}

	jsErrCloud.getStacktrace = function(error, errorFramesToSkip = 0, generatedFramesToSkip = 0) {
		return ErrorStackParser.parse(error).slice(errorFramesToSkip);
	}

	// Sometimes the stacktrace has less information than was passed to window.onerror.
	// This function will augment the first stackframe with any useful info that was
	// received as arguments to the onerror callback.
	jsErrCloud.decorateStack = function(stack, url, lineNo, charNo){
	  const culprit = stack[0]
	  if (!culprit) return stack
	  if (!culprit.fileName && typeof url === 'string') culprit.setFileName(url)
	  if (!culprit.lineNumber && isActualNumber(lineNo)) culprit.setLineNumber(lineNo)
	  if (!culprit.columnNumber) {
	    if (isActualNumber(charNo)) {
	      culprit.setColumnNumber(charNo)
	    } else if (window.event && isActualNumber(window.event.errorCharacter)) {
	      culprit.setColumnNumber(window.event.errorCharacter)
	    }
	  }
	  return stack
	}

	const isActualNumber = (n) => typeof n === 'number' && String.call(n) !== 'NaN'

})(window);
