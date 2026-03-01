export const siteMeta = Object.freeze({
    about: Object.freeze({
        photoZoneId: 'photo-zone',
        profileBoxId: 'profile',
        specsId: 'specs',
        contactsId: 'contacts',
        thumbnailsId: 'thumbnails',
        photoClassName: 'about-photo',
        thumbnailClassName: 'profile-thumbnail',
        photoImgAlt: 'about photo image',
        thumbnailImgAlt: 'profile thumbnail image'
    }),


    blog: Object.freeze({
        writingsBlogTypeName: 'writings',
        blogSectionHeaderId: 'blog_title',
        blogCaptionImgId: 'blog-caption-img',
        blogCaptionId: 'blog-caption-text',
        blogCaptionText: '라이팅스 (writings)',
        blogSectionHeaderIcon: './assets/icons/blog.png',
        blogSectionHeaderIconAlt: 'blog Section Header Icon',
        writingsTitleCharLength: 35,
        writingsSummaryCharLength: 110,
        writingsSubjectListRowCount: 4,

        lifelogBlogTypeName: 'lifelog',
        lifelogSectionHeaderId: 'lifelog_title',
        lifelogCaptionImgId: 'lifelog-caption-img',
        lifelogCaptionId: 'lifelog-caption-text',
        lifelogSectionHeaderIcon: './assets/icons/lifelog.png',
        lifelogCaptionText: '라이프로그 (lifelog)',
        lifelogSectionHeaderIconAlt: 'lifelog Section Header Icon',
        lifelogTitleCharLength: 34,
        lifelogSummaryCharLength: 0,
        lifelogSubjectListRowCount: 4,

        archiveBlogTypeName: 'archive',
        archiveSectionHeaderId: 'archive_title',
        archiveCaptionImgId: 'archive-caption-img',
        archiveCaptionId: 'archive-caption-text',
        archiveCaptionText: '아카이브 (archive)',
        archiveSectionHeaderIcon: './assets/icons/archive.png',        
        archiveSectionHeaderIconAlt: 'archive Section Header Icon',
        archiveTitleCharLength: 34,
        archiveSummaryCharLength: 0,
        archiveSubjectListRowCount: 3,

        reflectionBlogTypeName: 'reflection',
        reflectionSectionHeaderId: 'reflection_title',        
        reflectionCaptionImgId: 'reflection-caption-img',
        reflectionCaptionId: 'reflection-caption-text',
        reflectionCaptionText: '리플렉션 (reflection)',
        reflectionSectionHeaderIcon: './assets/icons/reflection.png',        
        reflectionSectionHeaderIconAlt: 'reflection Section Header Icon',
        reflectionTitleCharLength: 30,
        reflectionSummaryCharLength: 34,
        reflectionSubjectListRowCount: 5,
        
        latestPostClassName: 'latest-post',
        postIndexClassName: 'post-index',
        className: 'title_box',
        sectionHeaderItemListRowCount: 0
    }),


    photolog: Object.freeze({
        sectionHeaderId: 'photolog_title',
        sectionHeaderIcon: './assets/icons/photographer.png',
        sectionHeaderIconAlt: 'Photolog Icon',
        captionImgId: 'photolog-caption-img',
        captionId: 'photolog-caption-text',
        className: 'title_box',
        text: '포토로그 (photolog)',
        teaserListClassName: 'teaser-list',
        teaserClassName: 'teaser-figure',
        thumbnailClassName: 'photolog-thumbnail',
        thumbnailImgAlt: 'photolog-thumbnail-image',
        photoClassName: 'photolog-photo',
        photoImgAlt: 'photo Image'
    }),

    
    links: Object.freeze({
        sectionHeaderId: 'links_title',
        sectionHeaderIcon: './assets/icons/bookmark.png',
        sectionHeaderIconAlt: 'links Title Icon',
        captionId: 'links-caption-text',
        captionImgId: 'links-caption-img', 
        className: 'title_box',
        text: '링크 (references)',
        linkListId: 'links_list',
        linkItemListClassName: 'links_item_list'
    }),

    viewer: Object.freeze({
        writingsListSummaryCharLength: 52,
        writingsListTitleCharLength: 26,
        lifelogListSummaryCharLength: 0,
        lifelogListTitleCharLength: 26,
        archiveListSummaryCharLength: 0,
        archiveListTitleCharLength: 26,
        reflectionSummaryListCharLength: 24,
        reflectionTitleListCharLength: 24,
        
        writingsListViewerId: 'blog_post_list_all_viewer',
        lifelogListViewerId: 'lifelog_post_list_all_viewer',
        archiveListViewerId: 'archive_list_all_viewer',
        reflectionListViewerId: 'reflection_post_list_all_viewer',
        photologListViewerId: 'photolog-index-viewer',

        writingsSectionListName: '라이팅스 (writings) 목록',
        lifelogSectionListName: '라이프로그 (lifelog) 목록',
        archiveSectionListName: '아카이브 (archive) 목록',
        reflectionSectionListName: '리플렉션 (reflection) 목록',
        photologSectionListName: '포토로그 (photolog) 목록'
    }),

    selectSectionConfig(type) {
        const map = {
            writings: this.getWritingsSectionConfig(),
            lifelog: this.getLifelogSectionConfig(),
            archive: this.getArchiveSectionConfig(),
            reflection: this.getReflectionSectionConfig(),
            photolog: this.getPhotologSectionConfig()
        };

        return map[type] ?? null;
    },

    getPhotologSectionConfig() {
        return {
            sectionHeaderId: this.photolog.sectionHeaderId,
            captionImgId: this.photolog.captionImgId,
            captionId: this.photolog.captionId,
            photologListViewerId: this.viewer.photologListViewerId,
            className: this.photolog.className,
            photologSectionListName: this.viewer.photologSectionListName,
            sectionHeaderIcon: this.photolog.sectionHeaderIcon,
            text: this.photolog.text,
            sectionHeaderIconAlt: this.photolog.sectionHeaderIconAlt
        };
    },

    getWritingsSectionConfig() {
        return {
            sectionHeaderId: this.blog.blogSectionHeaderId,
            captionImgId: this.blog.blogCaptionImgId,
            captionId: this.blog.blogCaptionId,
            listViewerId: this.viewer.writingsListViewerId,
            postIndexClassName: this.blog.postIndexClassName,
            sectionListName: this.viewer.writingsSectionListName,
            blogTypeName: this.blog.writingsBlogTypeName,
            className: this.blog.className,            
            sectionHeaderIcon: this.blog.blogSectionHeaderIcon,
            captionText: this.blog.blogCaptionText,
            blogSectionHeaderIconAlt: this.blog.blogSectionHeaderIconAlt,
            latestPostClassName: this.blog.latestPostClassName,
            listTitleCharLength: this.viewer.writingsListTitleCharLength,
            listSummaryCharLength: this.viewer.writingsListSummaryCharLength, 
            headerItemListRowCount: this.blog.sectionHeaderItemListRowCount,
            titleCharLength: this.blog.writringsTitleCharLength, 
            summaryCharLength: this.blog.writingsSummaryCharLength, 
            subjectListRowCount: this.blog.writingsSubjectListRowCount
        };
    },

    getLifelogSectionConfig() {
        return {
            sectionHeaderId: this.blog.lifelogSectionHeaderId,
            captionImgId: this.blog.lifelogCaptionImgId,
            captionId: this.blog.lifelogCaptionId,
            listViewerId: this.viewer.lifelogListViewerId,
            postIndexClassName: this.blog.postIndexClassName,
            sectionListName: this.viewer.lifelogSectionListName,
            blogTypeName: this.blog.lifelogBlogTypeName,
            className: this.blog.className,            
            sectionHeaderIcon: this.blog.lifelogSectionHeaderIcon,
            captionText: this.blog.lifelogCaptionText,
            blogSectionHeaderIconAlt: this.blog.lifelogSectionHeaderIconAlt,
            latestPostClassName: this.blog.latestPostClassName,
            listTitleCharLength: this.viewer.lifelogListTitleCharLength,
            listSummaryCharLength: this.viewer.lifelogListSummaryCharLength, 
            headerItemListRowCount: this.blog.sectionHeaderItemListRowCount,
            titleCharLength: this.blog.lifelogTitleCharLength, 
            summaryCharLength: this.blog.lifelogSummaryCharLength, 
            subjectListRowCount: this.blog.lifelogSubjectListRowCount
        };
    },

    getArchiveSectionConfig() {
        return {
            sectionHeaderId: this.blog.archiveSectionHeaderId,
            captionImgId: this.blog.archiveCaptionImgId,
            captionId: this.blog.archiveCaptionId,
            listViewerId: this.viewer.archiveListViewerId,
            postIndexClassName: this.blog.postIndexClassName,
            sectionListName: this.viewer.archiveSectionListName,
            blogTypeName: this.blog.archiveBlogTypeName,
            className: this.blog.className,            
            sectionHeaderIcon: this.blog.archiveSectionHeaderIcon,
            captionText: this.blog.archiveCaptionText,
            blogSectionHeaderIconAlt: this.blog.archiveSectionHeaderIconAlt,
            latestPostClassName: this.blog.latestPostClassName,
            listTitleCharLength: this.viewer.archiveListTitleCharLength,
            listSummaryCharLength: this.viewer.archiveListSummaryCharLength, 
            headerItemListRowCount: this.blog.sectionHeaderItemListRowCount,
            titleCharLength: this.blog.archiveTitleCharLength, 
            summaryCharLength: this.blog.archiveSummaryCharLength, 
            subjectListRowCount: this.blog.archiveSubjectListRowCount
        };
    },

    getReflectionSectionConfig() {
        return {
            sectionHeaderId: this.blog.reflectionSectionHeaderId,
            captionImgId: this.blog.reflectionCaptionImgId,
            captionId: this.blog.reflectionCaptionId,
            listViewerId: this.viewer.reflectionListViewerId,
            postIndexClassName: this.blog.postIndexClassName,
            sectionListName: this.viewer.reflectionSectionListName,
            blogTypeName: this.blog.reflectionBlogTypeName,
            className: this.blog.className,            
            sectionHeaderIcon: this.blog.reflectionSectionHeaderIcon,
            captionText: this.blog.reflectionCaptionText,
            blogSectionHeaderIconAlt: this.blog.reflectionSectionHeaderIconAlt,
            latestPostClassName: this.blog.latestPostClassName,
            listTitleCharLength: this.viewer.reflectionTitleListCharLength,
            listSummaryCharLength: this.viewer.reflectionSummaryListCharLength, 
            headerItemListRowCount: this.blog.sectionHeaderItemListRowCount,
            titleCharLength: this.blog.reflectionTitleCharLength, 
            summaryCharLength: this.blog.reflectionSummaryCharLength, 
            subjectListRowCount: this.blog.reflectionSubjectListRowCount
        };
    },

    getSectionSummaryCharLengths() {
        return {
            writings: this.blog.writingsSummaryCharLength,
            lifelog: this.blog.lifelogSummaryCharLength,
            archive: this.blog.archiveSummaryCharLength,
            reflection: this.blog.reflectionSummaryCharLength
        };
    },

    getSectionTitleCharLengths() {
        return {
            writings: this.blog.writingsTitleCharLength,
            lifelog: this.blog.lifelogTitleCharLength,
            archive: this.blog.archiveTitleCharLength,
            reflection: this.blog.reflectionTitleCharLength
        };
    },

    getSectionWeights() {
        return {
            writings: [[1, 1], [0.9, 0.58], [0.8, 0.48]],
            lifelog: [[1, 1], [0.66, 0.66], [0.8, 0.5]],
            archive: [[1, 1], [0.66, 0.66], [0.8, 0.5]],
            reflection: [[1, 1], [0.9, 0.9], [0.8, 0.75]]
        };
    }    
});