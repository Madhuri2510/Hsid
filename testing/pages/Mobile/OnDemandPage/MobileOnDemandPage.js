const assert = require('assert');
const {I, constants} = inject();
const onDemandPageLocators = require('./OnDemandPageLocators.json');
const onDemandBaseClass = require('../../Browser/OnDemandPage/BrowserOnDemandPage');
const {getRandomNumberInRange} = require('../../CommonUtil/Util');
const isLandscape =
  process.argv[7].replace(/'/g, '') === constants.orientation.landscape;

const moduleCommonFunction = {
  async validateTrendingTitles() {
    if ((await I.getOrientation()) === 'PORTRAIT') {
      let tileCount = 0;
      let tileCountPortrait = await I.grabNumberOfVisibleElements(
          onDemandPageLocators.trendingTilesMobilePortrait
        ),
        i;
      for (
        i = 1;
        i <= Math.min(4, tileCountPortrait);
        i++ // 'tileCountPortrait' value is limited to 4 as sometimes erratic higher counts are returned
      ) {
        if (
          await I.isElementInViewPort(
            `${onDemandPageLocators.trendingTilesMobilePortrait}[${i}]`
          )
        )
          tileCount++;
      }
      assert.ok(
        Number(tileCount) >= 2,
        `Actual ${tileCount} tile(s); Expected - max 4 and min 2 Trending tiles should be visible`
      );
    } else if ((await I.getOrientation()) === 'LANDSCAPE') {
      let tileCount = await I.grabNumberOfVisibleElements(
        onDemandPageLocators.trendingTilesMobile
      );
      assert.ok(
        Number(tileCount) >= 4,
        `Actual ${tileCount} tile Expected 4 Trending tiles should be visible`
      );
    }
  },

  async validatePopularShowTitles() {
    if ((await I.getOrientation()) === 'PORTRAIT') {
      let tileCount = 0;
      let tileCountPortrait = await I.grabNumberOfVisibleElements(
          onDemandPageLocators.popShowTilesMobilePortrait
        ),
        i;
      await I.scrollToElement(
        onDemandPageLocators.lastTileLocatorMobilePortrait.replace(
          'label',
          'Popular Shows'
        )
      );
      for (
        i = 1;
        i <= Math.min(4, tileCountPortrait);
        i++ // 'tileCountPortrait' value is limited to 4 as sometimes erratic higher counts are returned
      ) {
        if (
          await I.isElementInViewPort(
            `${onDemandPageLocators.popShowTilesMobilePortrait}[${i}]`
          )
        )
          tileCount++;
      }
      assert.ok(
        Number(tileCount) >= 2,
        `Actual ${tileCount} tile; Expected - max 4 and min 2 Popular Show tiles should be visible`
      );
    } else if ((await I.getOrientation()) === 'LANDSCAPE') {
      let tileCount = await I.grabNumberOfVisibleElements(
        onDemandPageLocators.popShowTilesMobile
      );
      assert.ok(
        Number(tileCount) >= 4,
        `Actual ${tileCount} tile Expected 4 Popular Show tiles should be visible`
      );
    }
  },

  async validatePopMovieTitles() {
    if ((await I.getOrientation()) === 'PORTRAIT') {
      let tileCount = 0;
      let tileCountPortrait = await I.grabNumberOfVisibleElements(
          onDemandPageLocators.popMovieTilesPortrait
        ),
        i;
      await I.scrollToElement(
        onDemandPageLocators.lastTileLocatorMobilePortrait.replace(
          'label',
          'Popular Movies'
        )
      );
      for (
        i = 1;
        i <= Math.min(4, tileCountPortrait);
        i++ // 'tileCountPortrait' value is limited to 4 as sometimes erratic higher counts are returned
      ) {
        if (
          await I.isElementInViewPort(
            `${onDemandPageLocators.popMovieTilesPortrait}[${i}]`
          )
        )
          tileCount++;
      }
      assert.ok(
        Number(tileCount) >= 2,
        `Actual ${tileCount} tile; Expected max 4 and min 2 Popular Movie tiles should be visible`
      );
    } else if ((await I.getOrientation()) === 'LANDSCAPE') {
      let tileCount = await I.grabNumberOfVisibleElements(
        onDemandPageLocators.popMovieTilesMobile
      );
      assert.ok(
        Number(tileCount) >= 4,
        `Actual ${tileCount} tile Expected 4 Popular Movie tiles should be visible`
      );
    }
  },

  async clickSeeAll(laneNumber) {
    if ((await I.getOrientation()) === 'PORTRAIT') {
      const tileLocator = onDemandPageLocators.moreButtonMobilePortrait.replace(
        'index',
        laneNumber
      );
      await I.scrollToElement(tileLocator);
      await I.click(tileLocator);
      await I.wait(10);
    } else {
      const tileLocator = onDemandPageLocators.lastTileLocatorMobile.replace(
        'index',
        laneNumber
      );
      await I.scrollToElement(tileLocator);
      await I.click(tileLocator);
      await I.wait(10);
    }
  },

  async validateAllTitles() {
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.moreTilesMobile
    );
    assert.ok(
      Number(tileCount) > 20,
      `Actual ${tileCount} tile Expected 30 Trending tiles should be visible`
    );
    await I.tap(onDemandPageLocators.backButton);
  },

  async validateNavigation(laneNumber) {
    if ((await I.getOrientation()) === 'PORTRAIT') {
      await I.scrollToElement(
        onDemandPageLocators.lastTileLocatorMobilePortrait.replace(
          'label',
          'Trending Content'
        )
      );
      assert.ok(
        await I.isElementInViewPort(
          onDemandPageLocators.lastTileLocatorMobilePortrait.replace(
            'label',
            'Trending Content'
          )
        ),
        'Unable to navigate to element'
      );
      await I.scrollToElement(
        onDemandPageLocators.firstTileLocatorMobilePortrait.replace(
          'label',
          'Trending Content'
        )
      );
      // assert (await I.isElementInViewPort(onDemandPageLocators.firstTileLocatorMobilePortrait.replace('label', laneNumber)), "Unable to navigate to element");
    } else if ((await I.getOrientation()) === 'LANDSCAPE') {
      let lastTile = onDemandPageLocators.lastTileLocatorMobile.replace(
        'index',
        laneNumber
      );
      await I.waitForElement(lastTile);
      await I.scrollToElement(lastTile);
      assert.ok(
        await I.isElementVisible(onDemandPageLocators.seeAll),
        ' Cannot find See All Tile'
      );
      await I.scrollToElement(
        onDemandPageLocators.firstTileLocatorMobile.replace('index', laneNumber)
      );
    }
  },

  async clickRandomTitle() {
    let tileNumber = getRandomNumberInRange(1, 4);
    let laneNumber = getRandomNumberInRange(1, 3);
    let randomTile =
      (await I.getOrientation()) === 'PORTRAIT'
        ? onDemandPageLocators.randomTileMobilePortrait.replace(
            'index',
            tileNumber
          )
        : onDemandPageLocators.randomTileMobile
            .replace('index', laneNumber)
            .replace('index2', tileNumber);
    await I.scrollToElement(randomTile);
    await I.wait(5);
    await I.click(randomTile);
    await I.wait(3);
    await I.waitForElement(onDemandPageLocators.contentTitle, 20);
  },
};

module.exports = isLandscape
  ? {...onDemandBaseClass, ...moduleCommonFunction}
  : Object.assign(onDemandBaseClass, {
      // async validateNavigation() {
      //   await I.reportLog('Navigation working successfully');
      // },

      async validateSwimlanes() {
        assert.ok(
          I.isElementVisible(onDemandPageLocators.trendingContentLabel),
          'Trending content label is not visible'
        );
        assert.ok(
          I.isElementVisible(onDemandPageLocators.popularShowsLabel),
          'Popular shows label is not visible'
        );
        assert.ok(
          I.isElementVisible(onDemandPageLocators.popularMoviesLabel),
          'popular movies label is not visible'
        );
      },

      async validateNavigation(laneNumber) {
        let rightArrow = onDemandPageLocators.rightArrow + `[${laneNumber}]`;
        assert.ok(
          await I.isElementVisible(rightArrow),
          'Right arrow is not visible to navigate'
        );
        await I.click(rightArrow);
        await I.waitForElement(onDemandPageLocators.leftArrow, 5);
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.leftArrow),
          'Left arrow is not visible to navigate'
        );
      },

      async verifyContent() {
        await I.waitForElement(onDemandPageLocators.contentDescription, 20);
        await I.waitForElement(onDemandPageLocators.contentPlayButton, 10);
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.contentTitle),
          'Content title is not visible'
        );
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.contentRating),
          'Content rating is not visible'
        );
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.contentDescription),
          'Content description is not visible'
        );
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.contentPlayButton),
          'Play button is not visible to play the content'
        );
        await I.click(onDemandPageLocators.closeButton);
      },

      async verifyPlatformOptions() {
        await I.waitForElement(onDemandPageLocators.contentDescription, 20);
        await I.click(onDemandPageLocators.contentPlayButton);
        await I.waitForElement(
          onDemandPageLocators.closeButtonPlatformMobile,
          20
        );
        await I.waitForElement(onDemandPageLocators.platformOptions, 10);
        await I.wait(1);
        let optionsCount = await I.grabNumberOfVisibleElements(
          onDemandPageLocators.platformOptions
        );
        assert.ok(optionsCount >= 1, 'No platforms for user to choose');
      },
      ...moduleCommonFunction,
    });
