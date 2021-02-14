
// =========== { Директорії } ===========

let project_folder = require("path").basename(__dirname); // Вихідний файл
let source_folder = "#src"; // Вхідний файл

let fs = require("fs");

let path = {

    build: { // Вихідний файл
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/images/",
        fonts: project_folder + "/fonts/"
    },

    src: { // Вхідний файл
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.+(scss|sass)",
        js: source_folder + "/js/script.js",
        img: source_folder + "/images/**/*.+(png|jpg|gif|ico|svg|webp)",
        fonts: source_folder + "/fonts/*.+(ttf|woff|woff2)"
    },

    watch: { // Контрольовані файли
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.+(scss|sass)",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/images/**/*.+(png|jpg|gif|ico|svg|webp)"
    },

    clean: "./" + project_folder + "/"
}


// =========== { Підключенні плагіни } ===========

let { src, dest } = require("gulp");
let gulp = require("gulp");
let browser_sync = require("browser-sync").create(); // Хостинг
let file_include = require("gulp-file-include"); // Підключення html файлів
let del = require("del"); // Видалення файлів
let scss = require("gulp-sass") // Перетворення scss/sass в css
let autoprefixer = require("gulp-autoprefixer") // Автопрефікс
let group_media = require("gulp-group-css-media-queries"); // Групування media
let clean_css = require("gulp-clean-css"); // Зжимання css фуйлів
let rename = require("gulp-rename"); // Перейменування фуйлів
let clean_js = require("gulp-uglify"); // Зжимання js фуйлів
let imagemin = require("gulp-imagemin"); // Зжимання фотографій
let webp = require("gulp-webp"); // Перетворення картинок в формат webp
let webp_html = require("gulp-webp-html"); // Підключення webp в html
//let webp_css = require("gulp-webp-css"); // Підключення webp в css
let ttf2woff = require("gulp-ttf2woff"); // Перетворення шрифтів
let ttf2woff2 = require("gulp-ttf2woff2"); // Перетворення шрифтів
let zip = require("gulp-zip"); // Архівування проекту


// =========== { Налаштування плагінів } ===========

function browserSync() // Хостинг
{
    browser_sync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    });
}

function prepros() // Перетворення scss/sass в css
{
    return scss({
        outputStyle: "expanded"
    })
}

function autoprefix() // Автопрефікс
{
    return autoprefixer({
        overrideBrowserlist: ["last 5 versions"],
        cascade: true
    })
}

function image_min() // Зжаття фотографій
{
    return imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3,
        svgoPlugins: [
            {
                removeViewBox: false
            }
        ]
    })
}

function fonts_style()  // Підключення шрифтів
{
    let file_content = fs.readFileSync(source_folder + '/scss/resource/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/resource/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/resource/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() {} // Для fonts_style

function webp_img() // Перетворення картинок в формат webp
{
    return webp({
        quality: 70
    })
}

function claer() // Очистка вихідної папки
{
    return del(path.clean);
}


// =========== { Завдання } ===========

gulp.task('zip', function () {
    return gulp.src(project_folder)
        .pipe(zip(project_folder + '.zip'))
        .pipe(gulp.dest('./'))
});


// =========== { Створенні функції } ===========

function html() // html файли
{
    return src(path.src.html)
        .pipe(file_include()) // Підключаєм всі html файли
        .pipe(webp_html()) // Підключаємо webp
        .pipe(dest(path.build.html)) // Зберігаємо файл
        .pipe(browser_sync.stream())
}

function css() // css файли
{
    return src(path.src.css)
        .pipe(prepros()) // Перетворюємо scss/sass на css
        .pipe(group_media()) // Групуємо медіа
        .pipe(autoprefix()) // Додаємо префікси
        //.pipe(webp_css()) // Підключаємо webp
        .pipe(dest(path.build.css)) // Зберігаємо файл
        .pipe(clean_css()) // Зжимаємо файл
        .pipe(rename({
            extname: ".min.css"
        })) // Переіменовуємо зжатий файл
        .pipe(dest(path.build.css)) // Зжимаємо зжатий файл
        .pipe(browser_sync.stream())
}

function js() // js файли
{
    return src(path.src.js)
        .pipe(file_include()) // Підключаєм всі js файли
        .pipe(dest(path.build.js)) // Зберігаємо файл
        .pipe(clean_js()) // Зжимаємо файл
        .pipe(rename({
            extname: ".min.js"
        })) // Переіменовуємо зжатий файл
        .pipe(dest(path.build.js)) // Зберігаємо файл
        .pipe(browser_sync.stream())
}

function images() // html файли
{
    return src(path.src.img)
        .pipe(webp_img()) // Перетворюємо на webp файл
        .pipe(dest(path.build.img)) // Зберігаємо файл
        .pipe(src(path.src.img))
        .pipe(image_min()) // Зжимаємо фотографію
        .pipe(dest(path.build.img)) // Зберігаємо файл
        .pipe(browser_sync.stream())
}

function fonts() // Шрифти
{
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts)) // Зберігаємо файл

    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts)) // Зберігаємо файл
}

function watch_files() // Перевірка файлів
{
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}



let build = gulp.series(claer, gulp.parallel(js, css, html, images, fonts), fonts_style);
let watch = gulp.parallel(build, watch_files, browserSync);


// =========== { Експорти } ===========

exports.fonts_style = fonts_style;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;