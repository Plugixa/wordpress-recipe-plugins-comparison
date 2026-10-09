# WordPress Recipe Plugins Compared

A sourced comparison of the maintained WordPress recipe plugins: WP Recipe Maker, Recipe Card Blocks, Create, WP Delicious, Cooked, Tasty Recipes and Plugixa Recipe.

**Read it here: <https://plugixa.github.io/wordpress-recipe-plugins-comparison/>** (English, Français, Español, Deutsch, Italiano)

Every value links to the vendor page it came from. Where a value could not be confirmed, the table says "Not checked".

> Maintained by [Plugixa](https://www.plugixa.com/), the makers of [Plugixa Recipe](https://wordpress.org/plugins/plugixa-recipe/), one of the plugins compared. See the [methodology](https://plugixa.github.io/wordpress-recipe-plugins-comparison/methodology/) for how that conflict of interest is handled.

<!-- generated:start -->
| Plugin | Best for | Active installs | Rating (count) | Paid from |
|---|---|---|---|---|
| [Plugixa Recipe](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/plugixa-recipe/) | Best free option for a recipe directory | new | – | €39/yr |
| [WP Recipe Maker](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/wp-recipe-maker/) | Best overall for food blogs | 50,000+ | 4.96 (355) | $49/yr |
| [Recipe Card Blocks](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/recipe-card-blocks/) | Best value for several sites | 10,000+ | 4.8 (20) | $59/yr |
| [Create](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/create/) | Best free nutrition calculation | 6,000+ | 4.32 (25) | $150/yr |
| [WP Delicious](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/wp-delicious/) | Best for a recipe site with a one-time payment | 4,000+ | 4.9 (71) | $59/yr |
| [Cooked](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/cooked/) | Most complete free reader tools | 3,000+ | 3.89 (90) | $49/yr |
| [Tasty Recipes](https://plugixa.github.io/wordpress-recipe-plugins-comparison/plugins/tasty-recipes/) | Simplest paid plans | 2,000+ | 5 (2) | $49/yr |
<!-- generated:end -->

Install counts and ratings come from the wordpress.org plugin API and are refreshed weekly.

## Pages

- [Full feature table](https://plugixa.github.io/wordpress-recipe-plugins-comparison/#table)
- [Best WordPress recipe plugins](https://plugixa.github.io/wordpress-recipe-plugins-comparison/best/best-wordpress-recipe-plugins/)
- [Best free recipe plugins](https://plugixa.github.io/wordpress-recipe-plugins-comparison/best/best-free-recipe-plugins/)
- [Plugins for a recipe directory](https://plugixa.github.io/wordpress-recipe-plugins-comparison/best/recipe-directory-plugins/)
- [Recipe plugins with a nutrition calculator](https://plugixa.github.io/wordpress-recipe-plugins-comparison/best/recipe-plugins-with-nutrition-calculator/)
- [WP Recipe Maker vs Tasty Recipes](https://plugixa.github.io/wordpress-recipe-plugins-comparison/compare/wp-recipe-maker-vs-tasty-recipes/)
- [WP Recipe Maker alternatives](https://plugixa.github.io/wordpress-recipe-plugins-comparison/alternatives/wp-recipe-maker/)

## Corrections

Found a wrong or outdated value? [Open an issue](https://github.com/Plugixa/wordpress-recipe-plugins-comparison/issues/new) with a link to the vendor page that shows the correct one. Vendors are welcome to correct their own entries.

## How it works

| Path | Contents |
|---|---|
| `src/data/features.yaml` | The feature list |
| `src/data/products/*.yaml` | Facts per plugin; each checked value names its source |
| `src/data/wporg/*.json` | wordpress.org numbers, written by `npm run wporg` |
| `src/data/pages.yaml` | Which versus, alternatives and best-of pages exist |
| `src/i18n/{en,fr,es,de,it}/` | All text, one folder per language |

The build fails if a checked value has no source, or if a "partial" value has no note.

```sh
npm install
npm run dev      # local preview
npm run wporg    # refresh wordpress.org numbers
npm run readme   # regenerate the table above
npm run build    # output in dist/
```

To publish under another address, change `SITE` and `BASE` in `astro.config.mjs`.

## Licence

Code: MIT. Data and text: CC BY 4.0. Plugin names are trademarks of their owners.
