# Generated by Django 2.2.6 on 2019-11-19 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_auto_20191119_1616'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='item_variations',
            field=models.ManyToManyField(to='core.ItemVariation'),
        ),
    ]
