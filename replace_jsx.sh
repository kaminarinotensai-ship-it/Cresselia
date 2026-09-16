#!/bin/bash
sed -i '332,779c\
      <SelectionPopup\
        selectionPopup={selectionPopup}\
        setSelectionPopup={setSelectionPopup}\
        rendition={rendition}\
        selectedHighlightColor={selectedHighlightColor}\
        setSelectedHighlightColor={setSelectedHighlightColor}\
        handleAddNote={handleAddNote}\
        handleCopy={handleCopy}\
      />\
\
      <ReaderHeader\
        book={book}\
        isPureFocus={isPureFocus}\
        setIsPureFocus={setIsPureFocus}\
        searchContainerRef={searchContainerRef}\
        isSearchOpen={isSearchOpen}\
        setIsSearchOpen={setIsSearchOpen}\
        handleSearchSubmit={handleSearchSubmit}\
        searchInputRef={searchInputRef}\
        searchQuery={searchQuery}\
        setSearchQuery={setSearchQuery}\
        isSearching={isSearching}\
        searchResults={searchResults}\
        highlightMatch={highlightMatch}\
        goToLocation={goToLocation}\
        rendition={rendition}\
        layoutContainerRef={layoutContainerRef}\
        isLayoutMenuOpen={isLayoutMenuOpen}\
        setIsLayoutMenuOpen={setIsLayoutMenuOpen}\
        layoutMode={layoutMode}\
        setLayoutMode={setLayoutMode}\
        canvasTone={canvasTone}\
        setCanvasTone={setCanvasTone}\
        aaContainerRef={aaContainerRef}\
        isAaMenuOpen={isAaMenuOpen}\
        setIsAaMenuOpen={setIsAaMenuOpen}\
        fontSize={fontSize}\
        setFontSize={setFontSize}\
        fontFamily={fontFamily}\
        setFontFamily={setFontFamily}\
        handleFullscreen={handleFullscreen}\
        isFullscreen={isFullscreen}\
      />\
\
      {/* Main Content Area (Sidebar + Reader) */}\
      <div className="w-full flex-1 flex flex-row items-stretch gap-8 lg:gap-16 overflow-hidden min-h-0">\
        \
        <TocSidebar\
          isPureFocus={isPureFocus}\
          progressText={progressText}\
          toc={toc}\
          isLoading={isLoading}\
          currentChapter={currentChapter}\
          goToLocation={goToLocation}\
        />\
\
        {/* Reader Container */}\
        <div \
          className="w-full flex-1 rounded-xl shadow-sm border relative flex flex-col overflow-hidden min-h-0 transition-colors duration-300"\
          style={{ \
            backgroundColor: activeToneData.bg,\
            borderColor: activeToneData.border\
          }}\
        >\
          {isLoading && (\
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur z-10 text-folio-tertiary font-serif">\
              Loading EPUB...\
            </div>\
          )}\
\
          {/* EPUB Viewer */}\
          <div \
            ref={viewerRef} \
            className="flex-1 relative min-h-0 w-full py-4 md:py-8 px-4 md:px-10 lg:px-14 transition-all duration-300"\
          />\
\
          {/* Bottom Navigation Footer */}\
          {!isPureFocus && (\
            <div \
              className="shrink-0 flex items-center justify-between px-8 md:px-16 py-6 text-xs font-bold tracking-widest border-t transition-colors duration-300"\
              style={{ \
                borderColor: activeToneData.border, \
                color: canvasTone === \'Night\' || canvasTone === \'Slate\' ? \'#a1a1aa\' : \'#71717a\'\
              }}\
            >\
            <button \
              onClick={handlePrev}\
              className="flex items-center gap-3 hover:text-folio-primary transition-colors uppercase group"\
              aria-label="Previous Page"\
            >\
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />\
              <span>Previous</span>\
            </button>\
            \
            <span className="text-[#a87d60] font-medium tracking-widest uppercase">\
              {progressText.replace(\'P.\', \'PAGE\')}\
            </span>\
            \
            <button \
              onClick={handleNext}\
              className="flex items-center gap-3 hover:text-folio-primary transition-colors uppercase group"\
              aria-label="Next Page"\
            >\
              <span>Next</span>\
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />\
            </button>\
          </div>\
          )}\
        </div>\
\
        <AnnotationSidebar\
          isPureFocus={isPureFocus}\
          notes={notes}\
          currentIndex={currentIndex}\
          handleDeleteNote={handleDeleteNote}\
        />\
\
      </div>\
' src/components/Reader.tsx
