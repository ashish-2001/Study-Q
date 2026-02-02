import db from '../src/db';

async function seedUsers(){
    try{
        await db.user.upsert({
            where: {
                id: '1'
            },
            create: {
                id: '1',
                email: 'testuser@example.com',
                name: 'Test User 1',
                disableDrm: false
            },
            update: {}
        });

        await db.user.upsert({
            where: {
                id: '2'
            },
            create: {
                id: '2',
                email: 'testuser2@example.com',
                name: 'Test User 2',
                disableDrm: false
            },
            update: {}
        });
    } catch(error){
        console.log('Error seeding users:', error);
        throw error;
    }
}

async function seedCourses(){
    const courses = [
        {
            id: 1,
            appxCourseId: '1',
            discordRoleId: '2',
            title: 'test course 1',
            imageUrl: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/test1.png',
            description: 'test course 1',
            openToEveryone: false,
            slug: 'test-course-1'
        },
        {
            id: 2,
            appxCourseId: '2',
            discordRoleId: '3',
            title: 'test course 2',
            imageUrl: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/test2.png', 
            description: 'test course 2',
            openToEveryone: false,
            slug: 'test-course-2'
        },
        {
            id: 3,
            appxCourseId: '2',
            discordRoleId: '3',
            title: 'test course 2',
            imageUrl: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/test2.png',
            description: 'test course 2',
            openToEveryone: false,
            slug: 'test-course-2'
        },
        {
            id: 4,
            appxCourseId: '2',
            discordRoleId: '3',
            title: 'test course 2',
            imageUrl: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/test2.png',
            description: 'test course 2',
            openToEveryone: false,
            slug: 'test-course-2'
        },
        {
            id: 5,
            appxCourseId: '2',
            discordRoleId: '3',
            title: 'test course 2',
            imageUrl: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/test2.png',
            description: 'test course 2',
            openToEveryone: false,
            slug: 'test-course-2'
        }
    ];

    try{
        const existingCourses = await db.course.findMany();
        if(existingCourses.length > 0){
            console.error('DB is already with courses.');
            return;
        }
        await db.course.createMany({ data: courses });
    } catch(e){
        console.error('Error seeding courses:', e);
        throw error;
    }
};

async function seedContent(){
    const folderData = {
        type: 'folder',
        title: 'week 1',
        hidden: false,
        thumbnail: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/week-1.png',
        commentCount: 0
    };

    try{
        const createFolder = await db.content.create({ data: folderData });
        console.log('Created folder:', createFolder);
        const folderId = createFolder.id;

        const contentData = [
            {
                type: 'notion',
                title: 'Notes for week 1',
                hidden: false,
                thumbnail: 'https://appx-recordings.s3.ap-south-1.com/drm/100x/images/notes.png',
                parentId: folderId,
                commentsCount: 0
            },
            {
                type: 'video',
                title: 'test video for week 1',
                hidden: false,
                thumbnail: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/images/week-1-orientation.jpg',
                parentId: folderId,
                commentsCount: 0
            }
        ];

        const createContent = await db.content.createMany({ data: contentData });
        console.log('Created content:', createdContent);
    } catch(error){
        console.error('Error seeding content:', error);
        throw error;
    }
}

async function seedCourseContent(){
    try{
        await db.courseContent.create({
            data: {
                courseId: 1,
                contentId: 1
            }
        });
    } catch(error){
        console.error('Error seeding course content:', error);
        throw error;
    }
}

async function seedNotionMetadata(){
    try{
        await db.notionMetadata.create({
            data: {
                id: 1,
                notionId: 'rtqortp7q8wp374527346qwir',
                contentId: 2
            }
        });
    } catch(error){
        console.error('Error seeding notion metadata:', error);
        throw error;
    }
}

async function seedVideoMetadata(){
    try{
        await db.videoMetadata.create({
            data: {
                id: 1,
                contentId: 3,
                video_1080p_mp4_1: 'https://www.w3schools.com/html/mov_bbb.mp4',
                slides: 'https://appx-recordings.s3.ap-south-1.amazonaws.com/drm/100x/slides/Loops%2C+callbacks.pdf',
                segments: [
                    { title: 'Instruction', start: 0, end: 3 },
                    { title: 'Chapter 1', start: 3, end: 7 },
                    { title: 'conclusion', start: 7, end: 10 }
                ]
            }
        });
    } catch(error){
        console.error('Error seeding video metadata:', error);
        throw error;
    }
}

async function seedPurchases(){
    try{
        await db.userPurchases.create({
            data: {
                userId: '1',
                courseId: 1
            }
        });
        await db.userPurchases.create({
            data: {
                userId: '2',
                courseId: 1
            }
        });
        await db.userPurchases.create({
            data: {
                userId: '1',
                courseId: 2
            }
        });

        await db.userPurchases.create({
            data: {
                userId: '2',
                courseId: 2
            }
        });
    } catch(error){
        console.error('Error while seeding purchases');
        throw error;
    }
}

export async function addClassesFromAugustToMay(){
    const startDate = new Date('2024-08-01T00:00+05:30');
    const endDate = new Date('2025-05-31T23:59:59+05:30');

    for(
        let date = new Date(startDate); 
        date <= endDate;
        date.setDate(date.getDate() + 1)
    ){
        if(date.getDay() === 5){
            await db.event.create({
                data: {
                    title: 'Web 3 class',
                    start: new Date(date.setHours(19, 30, 0, 0)),
                    end: new Date(date.setHours(21, 30, 0, 0))
                }
            });
        } else if(date.getDay() === 6 || date.getDay() === 0){
            await db.event.create({
                data: {
                    title: 'Web devs devops class',
                    start: new Date(date.setHours(19, 30, 0, 0)),
                    end: new Date(date.setHours(21, 30, 0, 0))
                }
            });
        }
    }
}

async function seedDatabase(){
    try{
        await seedUsers();
        await seedCourses();
        await seedContent();
        await seedCourseContent();
        await seedNotionMetadata();
        await seedVideoMetadata();
        await seedPurchases();
        await addClassesFromAugustToMay();
    } catch(error){
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

seedDatabase().catch((error) => {
    console.error('An unexpected error occurred during seeding:', error);
    process.exit(1);
});