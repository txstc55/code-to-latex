class codeKeywords {
  constructor() {
    // list of keywords in listing package
    this.keywords = [];
    this.additionalKeywords = [];
    this.emphasis0 = [];
    this.emphasis1 = [];
    this.emphasis2 = [];
    this.parseKeywords(
      "add, after, alias, analyzer, and, append, appending, area, assign, at, authority-check, before, binary, blank, break-point, calendar, call, case, change, changing, check, clear, cnt, co, collect, commit, common, component, compute, condense, corresponding, cos, cp, cs, currency-conversion, cursor, data, database, dataset, decimals, define, delete, deleting, dequeue, describe, detail, dialog, directory, div, divide, do, documentation, during, dynpro, else, end-of-page, end-of-selection, endat, endcase, enddo, endfor, endform, endif, endloop, endmodule, endselect, endwhile, enqueue, exceptions, exit, exp, export, exporting, extract, field, fields, field-groups, field-symbols, find, for, form, format, free, from, function, generating, get, giving, hide, id, if, import, importing, in, incl, include, initial, initialization, input, insert, interrupt, into, is, language, leave, leading, left-justified, like, line, lines, line-count, line-selection, list-processing, load, local, log, logfile, loop, margin, mark, mask, memory, menue, message, mod, modify, move, move-text, multiply, na, new, new-line, new-page, no-gaps, np, ns, number, obligatory, occurs, of, on, or, others, output, parameter, parameters, parts, perform, pf-status, places, position, process, raise, raising, ranges, read, refresh, refresh-dynpro, reject, remote, replace, report, reserve, reset, restart, right-justified, run, screen, scroll, search, segments, select, select-options, selection-screen, set, shift, sin, single, sqrt, start-of-selection, statement, structure, submit, subtract, summary, summing, suppress, system, table, tables, task, text, time, to, top-of-page, trace, transaction, transfer, transfer-dynpro, translate, type, unpack, update, user-command, using, value, when, where, while, window, with, workfile, write, def, return",
    );
  }

  parseKeywords(keywords) {
    // split the string by commas
    this.keywords = keywords.split(", ");
  }

  parseAdditionalKeywords(additionalKeywords) {
    this.additionalKeywords = additionalKeywords.split(",");
  }

  parseEmphasis0(emphasis0) {
    this.emphasis0 = emphasis0.split(",");
  }

  parseEmphasis1(emphasis1) {
    this.emphasis1 = emphasis1.split(",");
  }

  parseEmphasis2(emphasis2) {
    this.emphasis2 = emphasis2.split(",");
  }

  // check is in keywords list
  checkInKeywords(word) {
    if (this.keywords.includes(word)) {
      return 1;
    } else if (this.additionalKeywords.includes(word)) {
      return 2;
    }
    return 0;
  }

  // check if is an emphasis keyword
  checkInEmphasis(word) {
    if (this.emphasis0.includes(word)) {
      return 0;
    }
    if (this.emphasis1.includes(word)) {
      return 1;
    }
    if (this.emphasis2.includes(word)) {
      return 2;
    }
    return -1;
  }
}

export default codeKeywords;
